.PHONY: build run swagger tidy

# 建構後端二進位
build:
	go build -o bin/server ./cmd/server/main.go

# 啟動後端（直接執行，不建構二進位）
run:
	go run ./cmd/server/main.go

# 重新生成 Swagger 文件（需先安裝 swag：go install github.com/swaggo/swag/cmd/swag@latest）
swagger:
	swag init -g cmd/server/main.go -o docs

# 整理 go.mod / go.sum 依賴
tidy:
	go mod tidy
