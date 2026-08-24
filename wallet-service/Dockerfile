FROM golang:1.25-alpine
WORKDIR /usr/src/app
COPY go.mod go.sum ./
COPY main.go .
COPY internal ./internal
COPY admin ./admin
COPY user ./user
COPY vendorsvc ./vendorsvc
RUN go mod download
RUN go build -mod=mod -o wallet-service .
EXPOSE 3005
CMD ["./wallet-service"]
