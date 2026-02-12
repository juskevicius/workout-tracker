variable "google_client_id" {
  type        = string
  default     = "your-client-id.apps.googleusercontent.com"
  description = "Google Client ID for OAuth authentication"
}

variable "google_client_secret" {
  type        = string
  default     = "your-client-secret"
  description = "Google Client Secret for OAuth authentication"
}
