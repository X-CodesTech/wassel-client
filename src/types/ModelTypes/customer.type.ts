export interface ICustomer {
  _id: string;
  blocked: boolean;
  companyChainId?: string;
  custAccount: string;
  custName: string;
  updatedAt: Date;
  createdDate: Date;
}
