# Whales PreMarket Next.js Example

Đây là ứng dụng ví dụ sử dụng thư viện Whales PreMarket SDK với Next.js.

## Cài đặt

```bash
# Cài đặt dependencies
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

## Cấu hình

Trước khi chạy ứng dụng, bạn cần cập nhật các thông tin cấu hình trong file `src/app/layout.tsx`:

1. Cập nhật địa chỉ RPC cho Solana (hiện đang sử dụng devnet)
2. Cập nhật địa chỉ contract cho Solana (`YOUR_PROGRAM_ID`)
3. Cập nhật địa chỉ RPC cho EVM (hiện đang sử dụng Infura)
4. Cập nhật địa chỉ contract cho EVM (`0xYourContractAddress`)

## Chạy ứng dụng

```bash
# Chạy ở môi trường development
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt để xem ứng dụng.

## Cấu trúc dự án

- `src/app/layout.tsx`: Cấu hình WhalesPreMarketProvider và các provider cần thiết
- `src/app/page.tsx`: Sử dụng hook useWhalesPreMarket để tương tác với thị trường

## Tính năng

- Hiển thị danh sách thị trường đã cấu hình
- Hiển thị ID của offer cuối cùng
- Tạo offer mới

## Lưu ý

- Ứng dụng này yêu cầu kết nối ví Solana (như Phantom) và ví EVM (thông qua Wagmi)
- Đảm bảo bạn đã cài đặt các extension ví cần thiết trong trình duyệt
- Các giao dịch thực hiện trên testnet/devnet sẽ không ảnh hưởng đến tài sản thật 