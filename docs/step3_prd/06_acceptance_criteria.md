# ✅ Acceptance Criteria
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.1  
> **Ngày tạo:** 2026-02-08  
> **Cập nhật:** 2026-04-04  
> **Format:** Given-When-Then (Gherkin)

---

## 1. Authentication

### AC-101: Admin Login Success

```gherkin
Feature: Admin Login

Scenario: Successful login with valid credentials
  Given I am on the login page
  And I have a valid admin account
  When I enter correct username "admin@example.com"
  And I enter correct password
  And I click the "Login" button
  Then I should be redirected to the Dashboard
  And I should see my username in the header
  And I should see the main navigation menu

Scenario: Failed login with wrong password
  Given I am on the login page
  When I enter username "admin@example.com"
  And I enter wrong password
  And I click the "Login" button
  Then I should see an error message "Invalid credentials"
  And I should remain on the login page

Scenario: Account locked after multiple failures
  Given I am on the login page
  And I have already failed login 4 times
  When I enter wrong password again
  Then I should see "Account locked. Try again in 15 minutes"
  And I should not be able to login for 15 minutes
```

---

### AC-102: Admin Logout

```gherkin
Feature: Admin Logout

Scenario: Logout from dashboard
  Given I am logged in as Admin
  And I am on any page in the dashboard
  When I click the user menu in the header
  And I click "Logout"
  Then I should be redirected to the login page
  And my session should be invalidated
  And I should not be able to access dashboard URLs

Scenario: Session expiry
  Given I have been inactive for 15 minutes
  When my access token expires
  Then I should see a warning "Session expiring, click to continue"
  When I don't respond within 1 minute
  Then I should be logged out automatically
```

---

### AC-103: Password Reset

```gherkin
Feature: Password Reset

Scenario: Request password reset
  Given I am on the login page
  When I click "Forgot Password"
  And I enter my email "admin@example.com"
  And I click "Send Reset Link"
  Then I should see "Check your email for reset instructions"
  And I should receive an email with reset link

Scenario: Reset password with valid link
  Given I received a password reset email
  When I click the reset link within 1 hour
  Then I should see the password reset form
  When I enter new password meeting requirements
  And I confirm the new password
  And I click "Reset Password"
  Then I should see "Password updated successfully"
  And I should be redirected to login page

Scenario: Expired reset link
  Given I received a password reset email 2 hours ago
  When I click the reset link
  Then I should see "This link has expired"
  And I should see "Request a new reset link"
```


### AC-104: Personal Profile Update

```gherkin
Feature: Personal Profile Management

Scenario: View profile info across roles
  Given I am logged in as Admin
  When I open the "My Profile" page
  Then I should see my full name, email (read-only), role, status, created date
  And I should see editable fields for phone, birth date, address, avatar

Scenario: Update profile successfully
  Given I am logged in as Shop Owner
  When I update my full name "Nguyễn Văn A", phone "+84901234567", and shop address
  And I click "Save"
  Then I should see toast "Profile updated"
  And the header avatar/name should refresh without page reload
  And an audit entry should be recorded

Scenario: Validation error on birth date
  Given I enter a birth date in the future
  When I click "Save"
  Then I should see error "Birth date must be in the past and user must be 18+"
  And the request should not be sent to the server

Scenario: Role-specific shop section
  Given I am logged in as Admin (non Shop Owner)
  When I open the profile page
  Then I should not see the Shop Details section
  But as a Shop Owner I should see Shop Name and Shop Address as required fields
```

---
---

## 2. POI Management

### AC-201: Create POI

```gherkin
Feature: Create POI

Scenario: Create POI with minimum required fields
  Given I am logged in as Admin
  And I am on the POI list page
  When I click "Add New POI" button
  And I enter POI name "Chùa Linh Ứng"
  And I enter description in Vietnamese
  And I click on the map to set location
  And I select category "Dining"
  And I click "Save" button
  Then a new POI should be created
  And I should see success message "POI created successfully"
  And the POI should appear in the list

Scenario: Create POI with images and audio
  Given I am on the Create POI form
  When I fill in all required fields
  And I upload 3 images (jpg, under 5MB each)
  And I upload an audio file (mp3, under 50MB)
  And I click "Save" button
  Then the POI should be created with media attached
  And images should show thumbnails in the form
  And audio duration should be displayed

Scenario: Validation error - missing required fields
  Given I am on the Create POI form
  When I leave name field empty
  And I click "Save" button
  Then I should see validation error "Name is required"
  And the form should not be submitted
```

### AC-202: Update POI

```gherkin
Feature: Update POI

Scenario: Edit POI basic information
  Given I am on the POI list page
  When I click edit icon for "Chùa ABC"
  Then I should see the edit form with current values
  When I change the name to "Chùa ABC Updated"
  And I click "Save"
  Then I should see success message "POI updated"
  And the list should show the new name

Scenario: Update POI location
  Given I am editing POI that belongs to a Tour
  When I change the coordinates
  Then I should see warning "This POI is in Tour: Tour XYZ"
  When I confirm the change
  Then the location should be updated
```

---

### AC-205: Upload Media

```gherkin
Feature: Upload Media Files

Scenario: Upload multiple images
  Given I am on the POI edit form
  When I click "Add Images"
  And I select 3 JPG files (each under 5MB)
  Then I should see upload progress for each file
  And thumbnails should appear after upload completes
  And I can drag to reorder images

Scenario: Upload audio file
  Given I am on the POI edit form
  When I upload an MP3 audio file (30MB)
  Then I should see upload progress
  And after completion I should see audio duration
  And there should be a preview play button

Scenario: File validation error
  When I try to upload a PNG file larger than 5MB
  Then I should see error "File size must be under 5MB"
  And the file should not be uploaded
```

---

### AC-206: Preview POI

```gherkin
Feature: Preview POI as Tourist

Scenario: Preview published POI
  Given I am viewing POI "Chùa ABC"
  When I click "Preview" button
  Then I should see mobile-style preview panel
  And it should display name, description, images
  And audio play button should work
  And I can toggle between VN/EN languages

Scenario: Preview draft POI
  Given POI "New POI" is in Draft status
  When I click "Preview"
  Then I should see the preview with draft content
  And there should be "Draft" badge visible
```

---

### AC-207: Draft/Publish Status

```gherkin
Feature: POI Status Workflow

Scenario: Save POI as Draft
  Given I am creating a new POI
  When I fill required fields
  And I click "Save as Draft"
  Then POI should be saved with status "Draft"
  And it should appear in POI list with Draft badge
  And it should NOT appear in Tourist App

Scenario: Publish a Draft POI
  Given POI "Test POI" is in Draft status
  And it has all required content (name, description, location)
  When I click "Publish"
  Then status should change to "Published"
  And success message "POI is now live" should appear
  And it should be visible in Tourist App

Scenario: Unpublish a POI
  Given POI is currently Published
  When I click "Unpublish"
  Then I should see warning if POI is in a Tour
  When I confirm
  Then status should change to "Draft"
  And it should be removed from Tourist App
```

---

### AC-203: Delete POI

```gherkin
Feature: Delete POI

Scenario: Delete POI with confirmation
  Given I am on the POI list page
  And there is a POI named "Test POI"
  When I click the delete icon for "Test POI"
  Then I should see a confirmation dialog
  And the dialog should show "Are you sure you want to delete this POI?"
  When I click "Confirm Delete"
  Then the POI should be soft deleted
  And the POI should no longer appear in the list
  And I should see success message "POI deleted"

Scenario: Delete POI that is in a Tour
  Given POI "Chùa ABC" is part of Tour "Tour Đà Nẵng"
  When I try to delete "Chùa ABC"
  Then I should see warning "This POI is part of 1 tour"
  And I should be asked to confirm deletion
  When I confirm
  Then the POI should be removed from the Tour also
```

### AC-204: Map Location Picker

```gherkin
Feature: Set POI Location

Scenario: Pick location by clicking map
  Given I am on the POI form
  When I click on the map at a specific location
  Then a marker should appear at that position
  And the latitude field should be populated
  And the longitude field should be populated
  And I should see the address (reverse geocoded)

Scenario: Enter coordinates manually
  Given I am on the POI form
  When I enter latitude "16.0544"
  And I enter longitude "108.2022"
  And I click "Update Map"
  Then the map should center on those coordinates
  And the marker should move to that location

Scenario: Invalid coordinates
  When I enter latitude "200" (invalid)
  Then I should see error "Latitude must be between -90 and 90"
```

---

## 3. Tour Management

### AC-301: Create Tour with POIs

```
Feature: Create Tour

Scenario: Create a new Tour
  Given I am logged in as Admin
  When I navigate to Tours page
  And I click "Create Tour"
  And I enter name "Tour Phố Ẩm thực Vĩnh Khánh"
  And I enter description
  And I add 3 POIs to the Tour
  And I click "Save"
  Then the Tour should be created
  And it should contain 3 POIs in order

Scenario: Reorder POIs in Tour
  Given I am editing Tour "Tour ABC" with 5 POIs
  When I drag POI #3 to position #1
  Then POI order should be updated
  And the list should show new order immediately
```

---

### AC-302: Manage Tour POIs

```gherkin
Feature: Tour POI Management

Scenario: Add POI to existing Tour
  Given I am editing Tour "Tour XYZ"
  When I click "Add POI"
  And I select "Chùa ABC" from available POIs
  Then POI should be added to the Tour
  And it should appear at the end of POI list

Scenario: Remove POI from Tour
  Given Tour has 5 POIs
  When I click remove icon on POI #3
  Then confirmation dialog should appear
  When I confirm
  Then POI should be removed from Tour
  And remaining POIs should reorder automatically

Scenario: Cannot publish Tour with less than 2 POIs
  Given Tour has only 1 POI
  When I try to Publish the Tour
  Then I should see error "Tour must have at least 2 POIs"
```

---

## 4. Tourist App - Map

### AC-401: View POIs on Map

```gherkin
Feature: POI Map Display

Scenario: Map loads with POI markers
  Given I open the Tourist App
  And I have granted location permission
  When the map loads
  Then I should see my current location marker
  And I should see POI markers around me
  And each POI category should have its assigned color/icon per legend

Scenario: Tap on POI marker
  When I tap on a POI marker
  Then I should see a preview card
  And the card should show POI name and thumbnail
  And there should be a "View Details" button

Scenario: Map offline mode
  Given I have no internet connection
  And I have previously viewed this area
  When I open the map
  Then I should see cached map tiles
  And I should see cached POI markers
  And I should see "Offline" indicator
```

---

### AC-402: POI Detail View

```gherkin
Feature: POI Detail Display

Scenario: View POI details
  Given I am on the map screen
  When I tap on POI marker "Chùa XYZ"
  And I tap "View Details"
  Then I should see POI detail page
  And I should see POI name and description
  And I should see image gallery
  And I should see audio play button
  And I should see distance from my location

Scenario: Swipe through images
  Given I am viewing POI detail with 5 images
  When I swipe left on the image gallery
  Then I should see the next image
  And image counter should update to "2/5"
```

---

## 5. Tourist App - Audio

### AC-403: Audio Playback

```gherkin
Feature: Audio Player

Scenario: Play audio from POI detail
  Given I am viewing POI detail "Chùa Linh Ứng"
  When I tap the "Play Audio" button
  Then audio should start playing
  And I should see progress bar moving
  And I should see current time updating
  And the play button should change to pause icon

Scenario: Control audio playback
  Given audio is currently playing
  When I tap the pause button
  Then audio should pause
  And the button should change to play icon
  When I drag the progress bar to 50%
  Then audio should seek to that position

Scenario: Background playback
  Given audio is playing
  When I press the home button (minimize app)
  Then audio should continue playing
  And I should see notification with playback controls

Scenario: Singleton Audio Manager
  Given audio of POI A is currently playing
  When I enter the trigger zone of POI B
  And audio for POI B is triggered to play
  Then audio of POI A must stop immediately
  And audio from POI B is the only track playing
```

### AC-404: Auto-trigger Audio

```gherkin
Feature: GPS Auto-trigger

Scenario: Enter POI geofence
  Given I am walking near POI "Chùa XYZ"
  And my location is outside the trigger radius
  When I walk closer and enter the 50m radius (default)
  Then a bottom sheet should appear showing POI info
  And audio should start playing automatically (autoPlay)
  And I should NOT be asked whether to play

Scenario: Exit-based cooldown
  Given I just triggered POI "Chùa XYZ"
  And I am still inside the trigger zone
  When I walk away and exit the trigger radius
  Then the POI is reset (removed from triggered set)
  When I walk back into the trigger zone
  Then the POI should trigger again

Scenario: Overlapping POI zones
  Given there are 2 POIs within 10m of each other
  When I enter both trigger zones simultaneously
  Then only the closer POI should be triggered
  And I can manually access the other POI
```

---

### AC-503: QR Code Fallback

```gherkin
Feature: QR Code Scanning

Scenario: Scan valid QR code without heavy media (TH1)
  Given I have synced offline data
  And I am at a POI scanning its QR code
  When the POI text data exists in SQLite
  And the POI does not have heavy audio/video
  Then I should immediately see the POI text details without network loading
  
Scenario: Scan valid QR code with heavy media (TH2)
  Given I am at a POI scanning its QR code
  When the POI data indicates it has heavy audio/video attached
  Then the app should display an alert "Dữ liệu lớn"
  And it should explain that a network connection is required
  When I accept the alert
  Then I am navigated to the online POI Detail view to stream the audio

Scenario: Scan invalid QR code
  When I scan a QR code that is not from GPS Tours format (gpstours:poi:id)
  Then I should see error "Mã QR không hợp lệ"
  And I should have option to scan again

Scenario: QR code for deleted POI
  When I scan QR for a POI that has been deleted or not in sync
  Then the system will attempt online validation
  And if not found online, show "Mã QR không thuộc hệ thống"
```

---

### AC-504: Onboarding Flow

```gherkin
Feature: First-time User Onboarding

Scenario: Complete onboarding
  Given I am opening the app for the first time
  And I tap "Bắt đầu hành trình" on the Landing Page
  Then I should see welcome screen (slide 1: MapPin)
  When I tap "Tiếp tục"
  Then I should see explanation of auto-trigger feature (slide 2: Headphones)
  When I tap "Tiếp tục"
  Then I should see QR fallback explanation (slide 3: QrCode)
  When I tap "Bắt đầu khám phá"
  Then I should be taken to the map screen
  And I should not see onboarding again
  And GPS permission is requested on Map Screen entry, not during onboarding

Scenario: Skip onboarding
  Given I am on any onboarding screen
  When I tap "Skip"
  Then I should be taken to the map directly
  And onboarding should be marked as completed
```

---

### AC-505: GPS Permission Handling

```gherkin
Feature: GPS Permission Management

Scenario: Grant GPS permission
  Given I have not yet granted GPS permission
  When the app requests GPS permission
  And I tap "Allow"
  Then the app should start tracking my location
  And POI auto-trigger should be enabled

Scenario: Deny GPS permission
  Given I denied GPS permission
  When I continue using the app
  Then I should see "GPS disabled - using QR mode"
  And auto-trigger should be disabled
  And QR scanner should be prominently shown
  And I can still manually browse POIs on map

Scenario: Re-request permission
  Given I previously denied GPS permission
  When I go to Settings in the app
  And I tap "Enable GPS"
  Then I should see explanation why GPS is needed
  And there should be button to open device settings
```

---

### AC-506: Error Handling

```gherkin
Feature: Error Messages and Recovery

Scenario: Network error with retry
  Given I am trying to load POI details
  When network request fails
  Then I should see "Connection error"
  And I should see "Retry" button
  When I tap "Retry"
  Then the request should be attempted again

Scenario: Audio load failure
  Given I try to play audio for a POI
  When audio file fails to load
  Then I should see "Could not load audio"
  And I should see options [Retry] [Skip]
  When I tap "Skip"
  Then I can continue browsing

Scenario: GPS signal lost
  Given I am using the app with GPS
  When GPS signal is lost
  Then I should see "GPS signal weak"
  And auto-trigger should pause
  And I should see suggestion to use QR code
```

---

## 6. Language & Offline

### AC-601: Language Switch

```gherkin
Feature: Language Selection

Scenario: Change language to English
  Given I am using the app in Vietnamese
  When I go to Settings
  And I select "English" as language
  Then the app UI should change to English
  And POI content should show English text
  And audio should play English version

Scenario: Fallback for missing translation
  Given I selected English language
  And POI "Quán ABC" only has Vietnamese content
  When I view that POI
  Then I should see Vietnamese content
  And I should see indicator "Content not available in English"
```

### AC-602: Offline Mode

```gherkin
Feature: Offline Access

Scenario: Use app offline
  Given I have previously viewed Tour "Tour ABC"
  And I have downloaded the tour for offline
  When I lose internet connection
  Then I should still see the map
  And I should see POI markers
  And I can tap POI to view cached details
  And I can play cached audio

Scenario: Sync when online
  Given I was offline for 2 hours
  When I reconnect to internet
  Then the app should sync in background
  And I should see "Syncing..." indicator briefly
  And any new POIs should appear
```

---

## 7. Shop Owner

### AC-701: Shop Owner Registration

```gherkin
Feature: Shop Owner Registration

Scenario: Register as Shop Owner
  Given I am on the registration page
  When I select role "Shop Owner"
  Then I should see Shop Owner registration form
  And the form should require: email, password, shop name, address, phone
  When I fill in all fields
  And I click "Register"
  Then I should receive verification email
  And after verifying I should access Shop Owner Dashboard

Scenario: Register as Tourist
  Given I am on the registration page
  When I select role "Tourist"
  Then I should see Tourist registration form
  And the form should require: email, password, display name
```

---

### AC-702: Shop Owner POI Management

```gherkin
Feature: Shop Owner Own POI Management

Scenario: View only own POIs
  Given I am logged in as Shop Owner "Quán Bún Mắm Tùng"
  And I own 3 POIs
  When I go to POI management page
  Then I should see only my 3 POIs
  And I should NOT see POIs owned by other Shop Owners or Admin

Scenario: View POI detail (read-only)
  Given I am viewing my POI list on the dashboard
  When I click the "View" button (ExternalLink icon) on "Quán Bún Mắm"
  Then I should be navigated to /owner/pois/:id
  And I should see the POI form with all data pre-filled
  And all form inputs should be disabled
  And existing media (images, audio) should be displayed
  And I should see a "Back" button but no "Save" button

Scenario: Edit own POI
  Given I am viewing my POI list
  When I click the "Edit" button on "Quán Bún Mắm"
  Then I should be navigated to /owner/pois/:id/edit
  And the form should show current POI data (fetched via GET /shop-owner/pois/:id)
  And existing media should be visible (images, audio with player)
  When I update the description
  And I click "Save Changes"
  Then changes should be saved successfully via PUT /shop-owner/pois/:id
  And I should be redirected to the dashboard with a success toast

Scenario: Generate TTS audio in edit mode
  Given I am editing my POI "Quán Bún Mắm" (the POI has been saved)
  And the Vietnamese description has at least 10 characters
  When I click "Generate VI Audio" button
  Then the system should call POST /tts/generate/:poiId
  And a loading spinner should appear on the button
  When TTS generation completes
  Then I should see a success toast "TTS audio generated"
  And the audio should appear in the existing audio list
  And I should be able to play it back

Scenario: Bilingual form labels switch with language tab
  Given I am on the POI form (create or edit)
  And the active language tab is "Vietnamese"
  Then all section headings should be in Vietnamese (e.g., "Nội dung POI", "Phân loại & thông tin")
  When I switch to the "English" tab
  Then all section headings should change to English (e.g., "POI Content", "Classification & Info")
  And all form labels, placeholders, and buttons should also be in English

Scenario: Cannot delete POI
  Given I am viewing my POI list
  Then I should NOT see any delete button
  And there should be no way to delete a POI

Scenario: Cannot access other Shop Owner's POI
  Given Shop Owner "B" owns POI with id=99
  When I try to access /owner/pois/99
  Then I should see "Access denied" (403 Forbidden)
  And I should be redirected to my dashboard

Scenario: Shop Owner Map View shows only own POIs
  Given I am logged in as Shop Owner
  When I navigate to /owner/map
  Then the map should display only POIs owned by me
  And the system should call GET /shop-owner/pois (not GET /pois)
  And the Tours dropdown should NOT be visible
  When I click a marker popup "View" button
  Then I should be navigated to /owner/pois/:id (not /admin/pois/:id)
```

---

### AC-703: Shop Owner Analytics

```gherkin
Feature: Shop Owner View Own Analytics

Scenario: View analytics dashboard
  Given I am logged in as Shop Owner
  When I go to Analytics page
  Then I should see stats for my POI(s) only
  And I should see total views, total audio plays
  And I should see trend chart (daily/weekly)

Scenario: No access to system-wide analytics
  Given I am logged in as Shop Owner
  When I try to access admin analytics URL
  Then I should see "Access denied"
```

---

## 8. TTS, Translation, Custom Tour, Merchant

### AC-901: TTS Generation

```gherkin
Feature: Generate TTS Audio

Scenario: Generate TTS for POI successfully
  Given I am logged in as Admin
  And POI "P001" has Vietnamese description
  When I click "Generate TTS" for language "VI"
  Then the system should create an MP3 audio file
  And a PoiMedia record with type AUDIO and language VI should be saved
  And I should see a success toast

Scenario: Shop Owner cannot generate TTS for POI not owned by self
  Given I am logged in as Shop Owner A
  And POI "P002" belongs to Shop Owner B
  When I call generate TTS for POI "P002"
  Then the API should return 403 Forbidden
```

### AC-904: Translation

```gherkin
Feature: Translate POI content

Scenario: Translate a POI description to English
  Given I am logged in as Admin
  And POI "P001" has Vietnamese description
  When I request translation to language "EN"
  Then the translated text should be returned
  And translated content should be persisted to POI fields

Scenario: Batch translation multiple POIs
  Given I am logged in as Admin
  When I submit batch translation request for 10 POIs
  Then the system should return per-item success/failure status
  And successful items should be saved
```

### AC-1001: Custom Tour CRUD

```gherkin
Feature: Tourist custom tours

Scenario: Create custom tour with selected POIs
  Given I am logged in as Tourist
  When I create a custom tour with 3 POIs
  Then the tour should be saved with tourType CUSTOM
  And it should appear in my tours list

Scenario: Delete owned custom tour
  Given I am logged in as Tourist
  And I have a custom tour "Food Night"
  When I delete the tour
  Then the custom tour should be soft-deleted
  And it should no longer appear in my tours list
```

### AC-1101: Merchant Management

```gherkin
Feature: Merchant CRUD by Admin

Scenario: Admin creates a merchant
  Given I am logged in as Admin
  When I submit valid merchant information
  Then a merchant record should be created
  And it should appear in merchant list

Scenario: Non-admin cannot create merchant
  Given I am logged in as Shop Owner
  When I call POST /merchants
  Then the API should return 403 Forbidden
```

### AC-705: Admin Map View

```gherkin
Feature: Admin map overview

Scenario: Admin sees all POIs on map
  Given I am logged in as Admin
  When I open /admin/map
  Then all active/draft/archived POIs should be rendered as markers
  And I can filter markers by status and category

Scenario: Shop Owner map is isolated by owner
  Given I am logged in as Shop Owner
  When I open /owner/map
  Then only my POIs should be visible
  And tour dropdown should not be shown
```

---

## 9. Summary Checklist

| Story | AC ID | Description | Status |
|-------|-------|-------------|--------|
| US-101 | AC-101 | Login scenarios | ✅ |
| US-201 | AC-201 | Create POI | ✅ |
| US-203 | AC-203 | Delete POI | ✅ |
| US-204 | AC-204 | Map picker | ✅ |
| US-301 | AC-301 | Create Tour | ✅ |
| US-401 | AC-401 | View map | ✅ |
| US-403 | AC-403 | Audio playback | ✅ |
| US-404 | AC-404 | Auto-trigger | ✅ |
| US-405 | AC-601 | Language | ✅ |
| US-409 | AC-602 | Offline | ✅ |
| **US-801** | **AC-701** | **Shop Owner Registration** | ✅ |
| **US-803** | **AC-702** | **Shop Owner POI Mgmt** | ✅ |
| **US-805** | **AC-703** | **Shop Owner Analytics** | ✅ |
| **US-901** | **AC-901** | **TTS generation** | ✅ |
| **US-904** | **AC-904** | **Translation single + batch** | ✅ |
| **US-1001** | **AC-1001** | **Custom Tour CRUD** | ✅ |
| **US-1101** | **AC-1101** | **Merchant CRUD** | ✅ |
| **US-705** | **AC-705** | **Admin/Owner map view** | ✅ |

---

> **Reference:** `PRDs/00_requirements_intake.md`, `04_user_stories.md`
