# 依存更新の記録（2026-10-24）

mukiとmuki-cursorのViteを5.4.21から保守対象の6.4.5へ、Rollupを4.54.0から4.65.0へ、esbuildを0.21.5から0.25.12へ更新しました。

教材・Reactコンポーネント・Vite設定と待受ホストは変更していません。型検査を無効化する変更もしていません。

## 検証

両方で最終lockfileからnpm ci --offlineとVite単体のproduction buildが成功しました。通常のnpm run buildは、未使用宣言によるTS6133がmukiに7件、muki-cursorに6件あり失敗します。更新前コミットの別コピーでnpm ciとnpm run buildを実行し、エラーが全件同一であることを確認しました。

## 未確認と反映境界

通常ビルドは既存エラーのため未通過です。完全に検証済みの配布候補とはせずdraftで保留します。再利用・公開前に既存の型検査エラーと画面動作を別途確認してください。

本記録はブランチ上の変更です。main merge、GitHub Pages本番deploy、nativeリリースは実施していません。

根拠: https://vite.dev/releases
