import type { RequestHistory } from "../entities/request-history.entity";

export interface RequestHistoryRepository {
  findAll(): Promise<RequestHistory[]>;
}