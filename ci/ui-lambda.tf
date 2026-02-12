locals {
  ui_lambda_name = "gratis-training-ui"
}

data "archive_file" "ui_lambda_archive" {
  type          = "zip"
  source_dir      = "../apps/ui/dist"
  output_file_mode = "0666"
  output_path      = "../apps/ui/zip/index.zip"
}

resource "aws_iam_role" "iam_for_ui_lambda" {
  name = "${local.ui_lambda_name}-iam-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy_attachment" "ui_lambda_role_to_policy_attachment" {
  name       = "${local.ui_lambda_name}-policy-attachment"
  roles      = [aws_iam_role.iam_for_ui_lambda.name]
  policy_arn = aws_iam_policy.ui_lambda_policy.arn
}

resource "aws_iam_policy" "ui_lambda_policy" {
  name   = "${local.ui_lambda_name}-policy"
  policy = data.aws_iam_policy_document.ui_lambda_policy_doc.json
}

data "aws_iam_policy_document" "ui_lambda_policy_doc" {
  statement {
    sid       = "CreateLogGroup"
    effect    = "Allow"
    resources = ["arn:aws:logs:${local.region}:${local.account_id}:*"]
    actions   = ["logs:CreateLogGroup"]
  }

  statement {
    sid = "PutLogs"
    effect    = "Allow"
    resources = ["arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/${local.ui_lambda_name}:*"]
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
  }
}

resource "aws_lambda_function" "ui_lambda_function" {
  depends_on = [
    data.archive_file.ui_lambda_archive,
    aws_cloudwatch_log_group.ui_lambda_log_group
  ]
  filename      = data.archive_file.ui_lambda_archive.output_path
  function_name = local.ui_lambda_name
  role          = aws_iam_role.iam_for_ui_lambda.arn
  handler       = "index.handler"

  source_code_hash = filebase64sha256(data.archive_file.ui_lambda_archive.output_path)
  runtime          = "nodejs22.x"
}

resource "aws_cloudwatch_log_group" "ui_lambda_log_group" {
  name              = "/aws/lambda/${local.ui_lambda_name}"
  retention_in_days = 3
}

resource "aws_lambda_function_url" "ui_url" {
  function_name      = aws_lambda_function.ui_lambda_function.function_name
  authorization_type = "NONE"
}