---

# **EI Student MyPage \- 開発・デプロイ運用マニュアル (v1.0)**

## **1\. ブランチ戦略**

本プロジェクトでは、Git Flowに基づいた3段階のブランチ管理を行います。

| ブランチ名 | 役割 | Vercelの動作 |
| :---- | :---- | :---- |
| **feature/\*** | 個別の機能追加、バグ修正、調整用。 | プレビューデプロイ（独自のURL発行） |
| **develop** | 開発統合・テスト用ブランチ。 | プレビューデプロイ（開発確認用URL） |
| **main** | **本番環境。** リリース準備が整ったコードのみ。 | **本番デプロイ**（本番用URL） |

---

## **2\. 開発から本番リリースまでの手順**

### **Step 1: 機能開発 (featureブランチ)**

新しい機能追加やデザイン調整を行う際は、必ず新しいブランチを作成します。

1. **ブランチ作成**: git checkout \-b feature/setup-metadata  
2. **AIでの開発**: Antigravity (Cursor) を使ってコードを修正。  
3. **コミットとプッシュ**:  
   * git add .  
   * git commit \-m "feat: メタデータの日本語化対応"  
   * git push origin feature/setup-metadata  
4. 

### **Step 2: 開発環境での統合・テスト (developブランチ)**

機能が完成したら、一度 develop ブランチに統合して動作を確認します。

1. **ブランチ切り替え**: git checkout develop  
2. **最新化**: git pull origin develop  
3. **マージ**: git merge feature/setup-metadata  
4. **プッシュ**: git push origin develop  
5. **動作確認**: Vercelから発行された develop 用のプレビューURLをスマホで開き、Salesforce連携やLIFFログインに問題がないか最終テストを行う。

### **Step 3: 本番リリース (mainブランチ)**

develop でのテストが完了し、問題がなければ本番へ反映します。

1. **ブランチ切り替え**: git checkout main  
2. **最新化**: git pull origin main  
3. **マージ**: git merge develop  
4. **プッシュ**: git push origin main  
5. **完了**: Vercelの本番デプロイが走り、生徒が利用する本番環境が更新されます。

---

## **3\. Antigravity (AI) への指示の出し方**

コード修正やブランチ操作をAIに依頼する際は、以下のように伝えるとスムーズです。

「今から休暇申請のタイトルを修正したいので、まず **feature/fix-vacation-title** ブランチを作成して。修正が終わったらコミットまでお願い。その後、私が develop へマージしてテストします。」

---

## **4\. 注意事項**

* **環境変数の同期**: 新しい環境変数（API Keyなど）を追加した場合は、Vercelの管理画面（Settings ➔ Environment Variables）にも必ず手動で追加してください。  
* **コンフリクトの解決**: マージ時に競合（コンフリクト）が発生した場合は、Antigravityに「コンフリクトを解消して」と依頼し、AIと一緒にコードを整理してください。

---

