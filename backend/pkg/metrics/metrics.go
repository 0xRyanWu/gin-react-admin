// pkg/metrics/metrics.go
// 定義並註冊 Prometheus 指標
// 提供 HTTP 請求次數（Counter）與請求耗時（Histogram）

package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	// HttpRequestsTotal 記錄各 path/method/status 的請求次數
	HttpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gin_http_requests_total",
			Help: "HTTP 請求總次數，依 path、method、status 分維度",
		},
		[]string{"path", "method", "status"},
	)

	// HttpRequestDuration 記錄各 path/method 的請求耗時分佈
	HttpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "gin_http_request_duration_seconds",
			Help:    "HTTP 請求耗時（秒），依 path、method 分維度",
			Buckets: []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
		},
		[]string{"path", "method"},
	)
)

func init() {
	// 將指標註冊至預設的全域 Registry
	prometheus.MustRegister(HttpRequestsTotal, HttpRequestDuration)
}
