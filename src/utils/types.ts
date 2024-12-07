export enum MessageType {
  SendUserMessage = "send-user-message",
  ClientReady = "client-ready",
  ServerReady = "server-ready",
  Interrupt = "interrupt",
  ItemsUpdated = "items-updated",
  RequestingFeedback = "requesting-feedback",
  FeedbackComplete = "feedback-complete"
}

export enum InterviewType {
  Merger = "merger",
  LBO = "lbo",
  DCF = "dcf",
  Valuation = "valuation",
  Enterprise = "enterprise",
  Accounting = "accounting",
  General = "general"
} 