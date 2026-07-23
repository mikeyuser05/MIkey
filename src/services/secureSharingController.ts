/**
 * PR10.5: Secure Data Sharing & Consent Controller
 * Manages privacy controls, zero-trust consent grants, and encrypted export authorization.
 */

import { DataSharingGrant, ConsentScope } from "../types/secureSharing";

export class SecureSharingController {
    private grants: Map<string, DataSharingGrant> = new Map();

    public createGrant(
        userId: string,
        recipientIdentifier: string,
        scope: ConsentScope,
        durationHours: number
    ): DataSharingGrant {
        const grant: DataSharingGrant = {
            grantId: `GRANT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            userId,
            recipientIdentifier,
            scope,
            expiresAt: Date.now() + durationHours * 3600 * 1000,
            isActive: true
        };

        this.grants.set(grant.grantId, grant);
        return grant;
    }

    public validateAccess(grantId: string, requestedData: keyof ConsentScope): boolean {
        const grant = this.grants.get(grantId);
        if (!grant) return false;

        if (!grant.isActive || Date.now() > grant.expiresAt) {
            grant.isActive = false;
            return false;
        }

        return grant.scope[requestedData] === true;
    }

    public revokeGrant(grantId: string): boolean {
        const grant = this.grants.get(grantId);
        if (!grant) return false;
        grant.isActive = false;
        return true;
    }
}
