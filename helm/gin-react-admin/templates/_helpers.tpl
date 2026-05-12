{{/*
helm/gin-react-admin/templates/_helpers.tpl
通用 template helper 函式
*/}}

{{/* Chart 完整名稱（release name + chart name） */}}
{{- define "gin-react-admin.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* 通用標籤 */}}
{{- define "gin-react-admin.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* 後端 Selector 標籤 */}}
{{- define "gin-react-admin.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "gin-react-admin.fullname" . }}-backend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* 前端 Selector 標籤 */}}
{{- define "gin-react-admin.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "gin-react-admin.fullname" . }}-frontend
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
