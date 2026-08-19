export interface Visit {
  _id: string;
  referenceNumber: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  purpose: string;
  personToVisit: string;
  unitNumber: string;
  unitBuilding: string;
  status: string;
  rejectionReason?: string;
  checkInAt?: string;
  checkOutAt?: string;
  visitDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export type VisitTableRow = Pick<
  Visit,
  | '_id'
  | 'referenceNumber'
  | 'status'
  | 'firstName'
  | 'lastName'
  | 'personToVisit'
  | 'unitNumber'
  | 'unitBuilding'
  | 'checkInAt'
  | 'checkOutAt'
  | 'visitDuration'
  | 'createdAt'
>;
