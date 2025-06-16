# Manual Testing Plan

## Prerequisites
- Backend API is running.
- Frontend application is running and accessible in a browser.
- Browser developer tools are available for inspecting network requests.
- Access to backend logs and database (optional, for deeper verification).

## I. Application Management

### 1.1. Create Application
- **Action:**
  - Navigate to the page for creating new applications.
  - Fill in the application name, description, logo (if applicable), and tags.
  - Submit the form.
- **Verification:**
  - UI: Success notification shown. New application appears in the application list.
  - Network: `POST` request to `/applications` (or `/tuna-api/applications` if context path is `/tuna-api`) with correct payload. Status code 201.
  - Backend Logs: Indication of application creation, default dataset, and policy creation.
  - Database: New record in `application` table, `dataset` table, `policy` table with correct associations and `createdBy` user ID.

### 1.2. View Applications
- **Action:**
  - Navigate to the application list page.
  - Click on a specific application to view its details.
- **Verification:**
  - UI: Application list displays correctly. Application details page shows correct information.
  - Network: `GET` request to `/applications` (or `/tuna-api/applications`) and `/applications/{appId}` (or `/tuna-api/applications/{appId}`). Status code 200.

### 1.3. Update Application
- **Action:**
  - Navigate to an existing application's edit page.
  - Modify fields like name, description, tags.
  - Submit the changes.
- **Verification:**
  - UI: Success notification. Updated information reflected in the application list and details page.
  - Network: `PUT` request to `/applications/{appId}` (or `/tuna-api/applications/{appId}`) with correct payload. Status code 200.
  - Backend Logs: Indication of application update.
  - Database: `application` table record updated.

### 1.4. Delete Application
- **Action:**
  - From the application list or details page, initiate delete for an application.
  - Confirm deletion.
- **Verification:**
  - UI: Success notification. Application removed from the list.
  - Network: `DELETE` request to `/applications/{appId}` (or `/tuna-api/applications/{appId}`). Status code 204 or 200.
  - Backend Logs: Indication of application deletion.
  - Database: `application` table record removed. (Note: `ApplicationService.deleteApplication` currently does not cascade delete datasets/policies. This might need to be verified if such behavior is expected or implemented later.)

## II. Data Item (Recipe) Management (within an Application's Dataset)

### 2.1. Navigate to Data Item Editor
- **Action:**
  - Select an application from the list.
  - Navigate to the "Dataset Editor" tab (or similarly named section for managing data items).
- **Verification:**
  - UI: Data item editor interface loads. It should display a list of existing data items (if any) associated with the application's dataset.
  - Network: `GET` request to `/api/datasets/{datasetId}/items` (or `/tuna-api/api/datasets/{datasetId}/items`). Status code 200. The `{datasetId}` should correspond to the selected application's linked dataset.

### 2.2. Create Data Item (Recipe)
- **Action:**
  - In the Data Item Editor, click the "Add Data Item" (or equivalent) button.
  - A dialog or form should appear. Fill in the required fields: name, description, and tags.
  - Click "Save" (or equivalent) to create the new data item.
- **Verification:**
  - UI: A success notification is displayed. The new data item appears in the list of items, ideally without a full page reload. The creation dialog closes.
  - Network: `POST` request to `/api/datasets/{datasetId}/items` (or `/tuna-api/api/datasets/{datasetId}/items`). The request payload should contain `name`, `description`, and `tags`. Status code 201 (Created).
  - Backend Logs: Logs should indicate the creation of a new recipe, associated with the correct `datasetId`.
  - Database: A new record should exist in the `recipe` table, with the correct `dataset_id`, `name`, `description`, `tags`, and other auto-generated fields like `id`, `created_at`, `updated_at`.

### 2.3. View Data Items
- **Action:** (This is largely covered by navigating to the editor (2.1) and after any CRUD operation on items)
  - Ensure the list of data items is displayed correctly, showing relevant information like name, description, and tags for each item.
- **Verification:**
  - UI: All data items for the currently selected application's dataset are listed accurately.

### 2.4. Update Data Item (Recipe)
- **Action:**
  - In the Data Item Editor, select an existing data item from the list.
  - Click an "Edit" button or icon associated with that item.
  - A dialog or form should appear, pre-filled with the item's current data.
  - Modify the name, description, or tags.
  - Click "Save" (or equivalent) to submit the changes.
- **Verification:**
  - UI: A success notification is displayed. The updated details of the item are reflected in the list. The edit dialog closes.
  - Network: `PUT` request to `/api/datasets/{datasetId}/items/{itemId}` (or `/tuna-api/api/datasets/{datasetId}/items/{itemId}`). The `{itemId}` should be the ID of the item being edited. The payload should contain the updated fields. Status code 200 (OK).
  - Backend Logs: Logs should indicate the update of an existing recipe.
  - Database: The corresponding record in the `recipe` table should be updated with the new values. The `updated_at` timestamp should also be updated.

### 2.5. Delete Data Item (Recipe)
- **Action:**
  - In the Data Item Editor, select an existing data item.
  - Click a "Delete" button or icon for that item.
  - A confirmation prompt should appear. Confirm the deletion.
- **Verification:**
  - UI: A success notification is displayed. The item is removed from the list.
  - Network: `DELETE` request to `/api/datasets/{datasetId}/items/{itemId}` (or `/tuna-api/api/datasets/{datasetId}/items/{itemId}`). Status code 204 (No Content) or 200 (OK).
  - Backend Logs: Logs should indicate the deletion of the recipe.
  - Database: The record for the item in the `recipe` table should be removed.

## III. General Checks
- **Error Handling:**
  - Attempt to create a data item with a blank name (which is a required field according to `CreateRecipeRequest`). Verify that a user-friendly error message is displayed by the UI and the request is not sent, or if sent, a 400 Bad Request is handled gracefully.
  - Test other validation errors if applicable (e.g., max length).
  - If possible, simulate server errors (e.g., 500) to see if the frontend handles them gracefully (e.g., shows a generic error message).
- **Consistency:**
  - After creating, updating, or deleting data items, navigate away from the Data Item Editor and then back to it, or refresh the page, to ensure the changes are persistent and consistently displayed.
- **Style and UI:**
  - Check that new UI elements (buttons, dialogs, list items for data items) conform to the existing visual style of the application.
  - Ensure there are no obvious layout issues, misalignments, or usability problems in the Data Item Editor.
  - Verify responsiveness if applicable (though not explicitly part of this feature).
```
