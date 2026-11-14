import type {
  PersonSummary,
  RequestSummary,
} from "../../domain/entities/request-history.entity";

export interface RequestHistoryResponseDto {
  id: string;
  action: string;
  changedAt: string;
  requestId: string;
  userId: string;
  user: PersonSummary;
  request: RequestSummary;
}