/**
 * PR10.5: Secure Data Sharing & Consent Types
 */

export interface ConsentScope {
    shareVitals: boolean;
    shareActivity: boolean;
    shareAnomalies: boolean;
    shareFullHistory: boolean;
}

export interface DataSharingGrant {
    grantId: string;
    userId: string;
    recipientIdentifier: string; // e.g., Provider/Clinician ID or Emergency Contact
    scope: ConsentScope;
    expiresAt: number;
    isActive: boolean;
}
