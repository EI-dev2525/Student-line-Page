# Salesforce - Supabase 同期仕様書 (v1.0)

## 1. 概要
Salesforce（SF）から Supabase へのデータ同期は、SF 側の HTTP コールアウト（POST メソッド）を使用してリアルタイムで行われます。
同期先は、Salesforce のオブジェクトタイプに合わせて `leads`（リード）と `students`（個人取引先）の2つのテーブルに分かれています。

## 2. 同期ロジック (UPSERT)
同期は `line_id` をキーとした UPSERT（挿入または更新）で行われます。
Supabase API (PostgREST) に対して以下のパラメータを付与してリクエストを送信します。

- **URL**: `https://[PROJECT_REF].supabase.co/rest/v1/[TABLE_NAME]`
- **Method**: `POST`
- **Headers**:
  - `apikey`: [ANON_KEY]
  - `Content-Type`: `application/json`
  - `Prefer`: `resolution=merge-duplicates` (UPSERTを有効化)
- **Query Params**:
  - `on_conflict=line_id`

## 3. テーブル・フィールドマッピング

### 3.1. leads テーブル (Salesforce: Lead)
見込み客およびカウンセリング前のユーザーデータを格納します。

| Supabase カラム | Salesforce 項目名 | 説明 |
| :--- | :--- | :--- |
| `line_id` | `bfml__LineId__c` | **UPSERT キー (PK)** |
| `sf_id` | `Id` | Salesforce Lead ID |
| `status` | `Status` | リードステータス |
| `campus` | `Campus__c` | 校舎 |
| `course` | `Course__c` | 希望コース |
| `level` | `Level__c` | 現在の英語レベル |
| `purpose` | `Purpose__c` | 学習目的 |
| `full_name` | `Name` | 氏名 |
| `email` | `Email` | メールアドレス |

### 3.2. students テーブル (Salesforce: Account/PersonAccount)
受講を開始した既存生徒のデータを格納します。

| Supabase カラム | Salesforce 項目名 | 説明 |
| :--- | :--- | :--- |
| `line_id` | `bfml__LineId__c` | **UPSERT キー (PK)** |
| `sf_id` | `Id` | Salesforce Account ID |
| `status` | `Status__c` | 生徒ステータス |
| `campus` | `Campus__c` | 所属校舎 |
| `target_score` | `TargetScore__c` | 目標スコア |
| `starting_score` | `StartingScore__c` | 入学時スコア |
| `current_course_end_date` | `CurrentCourseEndDate__c` | 現在のコース終了日 |
| `full_name` | `Name` | 氏名 |
| `email` | `PersonEmail` | メールアドレス |

### 3.3. contract_courses テーブル (Salesforce: Contract Course)
生徒に紐づく契約コース情報を格納します。

| Supabase カラム | Salesforce 項目名 | 説明 |
| :--- | :--- | :--- |
| `sf_id` | `Id` | **UPSERT キー (PK)** |
| `student_id` | `Student__c` | 生徒（Account）の Salesforce ID |
| `course_name` | `CourseName__c` | コース名 |
| `status` | `Status__c` | 受講ステータス |
| `start_date` | `StartDate__c` | 受講開始日 |
| `end_date` | `EndDate__c` | 受講終了日 |
| `campus` | `Campus__c` | 受講校舎 |
| `student_line_id` | `StudentLineId__c` | 生徒の LINE ID |
| `student_name` | `StudentName__c` | 生徒氏名 |

## 4. セキュリティ・RLS 仕様
Salesforce からの UPSERT を受け入れるため、以下の RLS ポリシーが設定されています。

- `SELECT`: `true` (全ユーザー参照可 - 必要に応じて要制限)
- `INSERT`: `true` (同期用 UPSERT 許可)
- `UPDATE`: `true` (同期用 UPSERT 許可)

## 5. アプリケーション側の取得優先順位
フロントエンド (`use-student-data.ts`) では、以下の順序でデータを検索します。

1. **`students` テーブル**: 該当する `line_id` があれば「既存生徒」として扱う。
2. **`leads` テーブル**: `students` になければこちらを検索し「リード」として扱う。

これにより、リードが既存生徒へ変換（コンバート）された際も、`students` テーブル側にデータが同期された時点で自動的にマイページが「生徒用」に切り替わります。
