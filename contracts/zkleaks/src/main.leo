// ZkLeaks: Anonymous Whistleblowing Protocol on Aleo
// Insiders prove organizational membership via ZK proofs without revealing identity.
// Reports are submitted with nullifiers to prevent double-reporting per topic.

// Structs must be defined outside the program block
struct OrgState {
    admin: address,
    member_count: u64,
    merkle_root: field,
    created_at: u32,
    active: bool,
}

struct ReportData {
    org_id: field,
    category: u8,       // 0=financial_fraud, 1=safety_violation, 2=corruption, 3=other
    severity: u8,        // 0=low, 1=medium, 2=high, 3=critical
    content_hash: field,  // hash of off-chain encrypted report content
    nullifier: field,     // public nullifier to prevent double-report
    proof_merkle_root: field, // merkle root used at time of proof
    timestamp: u32,
    verified: bool,
}

program zkleaks_v2.aleo {

    // ============================================================
    // ON-CHAIN STATE
    // ============================================================

    mapping organizations: field => OrgState;
    mapping org_exists: field => bool;
    mapping member_commitments: field => bool;
    mapping nullifiers: field => bool;
    mapping reports: field => ReportData;
    mapping org_report_count: field => u64;
    mapping report_counter: field => u64;
    mapping bounty_pool: field => u64;

    // Corroboration count: report_id => number of unique insiders who vouch
    mapping corroborations: field => u64;

    // Corroboration nullifiers: hash(member_secret, report_id) => bool
    // Prevents same member from corroborating twice
    mapping corroboration_nullifiers: field => bool;

    @noupgrade
    constructor() {
    }

    // Private record given to members as proof of registration
    record MembershipToken {
        owner: address,
        org_id: field,
        member_secret: field,
        commitment: field,
    }

    // Private record for submitted report (receipt for the whistleblower)
    record ReportReceipt {
        owner: address,
        report_id: field,
        org_id: field,
        nullifier: field,
    }

    // ============================================================
    // TRANSITIONS
    // ============================================================

    // Register a new organization
    fn register_org(
        public org_id: field,
        public initial_merkle_root: field,
    ) -> Final {
        // Bind self.caller before final block
        let caller: address = self.caller;

        return final {
            let exists: bool = org_exists.get_or_use(org_id, false);
            assert_eq(exists, false);

            let org: OrgState = OrgState {
                admin: caller,
                member_count: 0u64,
                merkle_root: initial_merkle_root,
                created_at: block.height,
                active: true,
            };

            organizations.set(org_id, org);
            org_exists.set(org_id, true);
            org_report_count.set(org_id, 0u64);
        };
    }

    // Add a member to an organization (admin only)
    // The member_secret is known only to the member
    fn add_member(
        public org_id: field,
        member_secret: field,
        public new_merkle_root: field,
    ) -> (MembershipToken, Final) {
        // Compute the commitment: hash(org_id, member_secret)
        let commitment: field = BHP256::hash_to_field(org_id + member_secret);
        let caller: address = self.caller;

        // Create private membership token for the member
        let token: MembershipToken = MembershipToken {
            owner: self.signer,
            org_id: org_id,
            member_secret: member_secret,
            commitment: commitment,
        };

        return (token, final {
            let exists: bool = org_exists.get_or_use(org_id, false);
            assert_eq(exists, true);

            let org: OrgState = organizations.get(org_id);
            assert_eq(org.admin, caller);

            let already_member: bool = member_commitments.get_or_use(commitment, false);
            assert_eq(already_member, false);
            member_commitments.set(commitment, true);

            let updated_org: OrgState = OrgState {
                admin: org.admin,
                member_count: org.member_count + 1u64,
                merkle_root: new_merkle_root,
                created_at: org.created_at,
                active: org.active,
            };
            organizations.set(org_id, updated_org);
        });
    }

    // Submit a whistleblower report with ZK proof of membership
    // The member proves they belong to the org WITHOUT revealing which member they are
    fn submit_report(
        membership: MembershipToken,
        public org_id: field,
        public category: u8,
        public severity: u8,
        public content_hash: field,
        topic_nonce: field,
    ) -> (MembershipToken, ReportReceipt, Final) {
        assert(category <= 3u8);
        assert(severity <= 3u8);

        // Verify the membership token matches the claimed org
        assert_eq(membership.org_id, org_id);

        // Recompute commitment from private data to verify authenticity
        let commitment: field = BHP256::hash_to_field(org_id + membership.member_secret);
        assert_eq(commitment, membership.commitment);

        // Compute nullifier: hash(member_secret, topic_nonce)
        // Prevents double-reporting without revealing identity
        let nullifier: field = BHP256::hash_to_field(membership.member_secret + topic_nonce);

        // Generate a report ID from public data
        let report_id: field = BHP256::hash_to_field(nullifier + content_hash);

        // Re-issue the membership token (consumed as input, re-created as output)
        let new_token: MembershipToken = MembershipToken {
            owner: membership.owner,
            org_id: membership.org_id,
            member_secret: membership.member_secret,
            commitment: membership.commitment,
        };

        // Create receipt for the whistleblower
        let receipt: ReportReceipt = ReportReceipt {
            owner: membership.owner,
            report_id: report_id,
            org_id: org_id,
            nullifier: nullifier,
        };

        return (new_token, receipt, final {
            let exists: bool = org_exists.get_or_use(org_id, false);
            assert_eq(exists, true);

            let is_member: bool = member_commitments.get_or_use(commitment, false);
            assert_eq(is_member, true);

            let already_reported: bool = nullifiers.get_or_use(nullifier, false);
            assert_eq(already_reported, false);
            nullifiers.set(nullifier, true);

            let org: OrgState = organizations.get(org_id);

            let report: ReportData = ReportData {
                org_id: org_id,
                category: category,
                severity: severity,
                content_hash: content_hash,
                nullifier: nullifier,
                proof_merkle_root: org.merkle_root,
                timestamp: block.height,
                verified: true,
            };
            reports.set(report_id, report);

            let count: u64 = org_report_count.get_or_use(org_id, 0u64);
            org_report_count.set(org_id, count + 1u64);

            let global: u64 = report_counter.get_or_use(0field, 0u64);
            report_counter.set(0field, global + 1u64);
        });
    }

    // Organization admin funds the bounty pool
    fn fund_bounty(
        public org_id: field,
        public amount: u64,
    ) -> Final {
        let caller: address = self.caller;

        return final {
            let exists: bool = org_exists.get_or_use(org_id, false);
            assert_eq(exists, true);
            let org: OrgState = organizations.get(org_id);
            assert_eq(org.admin, caller);

            let current: u64 = bounty_pool.get_or_use(org_id, 0u64);
            bounty_pool.set(org_id, current + amount);
        };
    }

    // Anyone can verify a report's nullifier is registered
    fn verify_report(
        public report_id: field,
    ) -> Final {
        return final {
            let report: ReportData = reports.get(report_id);
            assert_eq(report.verified, true);

            let null_exists: bool = nullifiers.get_or_use(report.nullifier, false);
            assert_eq(null_exists, true);
        };
    }

    // Admin: update the merkle root when membership changes
    fn update_merkle_root(
        public org_id: field,
        public new_merkle_root: field,
    ) -> Final {
        let caller: address = self.caller;

        return final {
            let exists: bool = org_exists.get_or_use(org_id, false);
            assert_eq(exists, true);
            let org: OrgState = organizations.get(org_id);
            assert_eq(org.admin, caller);

            let updated_org: OrgState = OrgState {
                admin: org.admin,
                member_count: org.member_count,
                merkle_root: new_merkle_root,
                created_at: org.created_at,
                active: org.active,
            };
            organizations.set(org_id, updated_org);
        };
    }

    // Corroborate a report: another insider vouches for the same report
    // Uses their membership token to prove they're in the same org
    // without revealing which member they are
    fn corroborate_report(
        membership: MembershipToken,
        public report_id: field,
        public org_id: field,
    ) -> (MembershipToken, Final) {
        // Verify membership token matches the org
        assert_eq(membership.org_id, org_id);

        // Recompute commitment
        let commitment: field = BHP256::hash_to_field(org_id + membership.member_secret);
        assert_eq(commitment, membership.commitment);

        // Compute corroboration nullifier: hash(member_secret, report_id)
        // Unique per member per report
        let corr_nullifier: field = BHP256::hash_to_field(membership.member_secret + report_id);

        // Re-issue token
        let new_token: MembershipToken = MembershipToken {
            owner: membership.owner,
            org_id: membership.org_id,
            member_secret: membership.member_secret,
            commitment: membership.commitment,
        };

        return (new_token, final {
            // Verify org exists
            let exists: bool = org_exists.get_or_use(org_id, false);
            assert_eq(exists, true);

            // Verify member is registered
            let is_member: bool = member_commitments.get_or_use(commitment, false);
            assert_eq(is_member, true);

            // Verify report exists
            let report: ReportData = reports.get(report_id);
            assert_eq(report.org_id, org_id);

            // Verify this member hasn't already corroborated
            let already_corroborated: bool = corroboration_nullifiers.get_or_use(corr_nullifier, false);
            assert_eq(already_corroborated, false);
            corroboration_nullifiers.set(corr_nullifier, true);

            // Increment corroboration count
            let count: u64 = corroborations.get_or_use(report_id, 0u64);
            corroborations.set(report_id, count + 1u64);
        });
    }
}
