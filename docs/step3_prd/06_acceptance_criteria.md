# ✅ Acceptance Criteria
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 2.0  
> **Ngày tạo:** 2026-02-08  
> **Cập nhật:** 2026-02-09  
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
  And I select category "MAIN"
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
  And MAIN POIs should have different icon than SUB POIs

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
```

### AC-404: Auto-trigger Audio

```gherkin
Feature: GPS Auto-trigger

Scenario: Enter POI geofence
  Given I am walking near POI "Chùa XYZ"
  And my location is outside the trigger radius (25m)
  When I walk closer and enter the 15m radius
  Then I should receive a notification
  And the notification should ask "Play audio for Chùa XYZ?"
  When I tap "Yes"
  Then audio for that POI should start playing

Scenario: Trigger cooldown
  Given I just triggered POI "Chùa XYZ" 2 minutes ago
  And I walked away and came back
  When I enter the trigger radius again
  Then I should NOT receive a notification
  And the cooldown indicator should show "3 min remaining"

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

Scenario: Scan valid QR code
  Given I am at a POI with QR code displayed
  When I open the QR scanner in the app
  And I scan the QR code
  Then the app should recognize the POI
  And I should be taken to that POI's detail page
  And audio can start playing

Scenario: Scan invalid QR code
  When I scan a QR code that is not from GPS Tours
  Then I should see error "Invalid QR code"
  And I should have option to scan again

Scenario: QR code for deleted POI
  When I scan QR for a POI that has been deleted
  Then I should see "This point of interest is no longer available"
```

---

### AC-504: Onboarding Flow

```gherkin
Feature: First-time User Onboarding

Scenario: Complete onboarding
  Given I am opening the app for the first time
  Then I should see welcome screen
  When I tap "Next"
  Then I should see explanation of auto-trigger feature
  When I tap "Next"
  Then I should see GPS permission request with explanation
  When I allow GPS permission
  And I tap "Get Started"
  Then I should be taken to the map screen
  And I should not see onboarding again

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

Scenario: Edit own POI
  Given I am viewing my POI list
  When I click edit on "Quán Bún Mắm"
  Then I should see the edit form with current values
  When I update the description
  And I click "Save"
  Then changes should be saved successfully

Scenario: Cannot delete POI
  Given I am viewing my POI list
  Then I should NOT see any delete button
  And there should be no way to delete a POI

Scenario: Cannot access other Shop Owner's POI
  Given Shop Owner "B" owns POI with id=99
  When I try to access /shop-owner/poi/99
  Then I should see "Access denied"
  And I should be redirected to my POI list
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

## 8. Summary Checklist

| Story | AC ID | Description | Status |
|-------|-------|-------------|--------|
| US-101 | AC-101 | Login scenarios | ☐ |
| US-201 | AC-201 | Create POI | ☐ |
| US-203 | AC-203 | Delete POI | ☐ |
| US-204 | AC-204 | Map picker | ☐ |
| US-301 | AC-301 | Create Tour | ☐ |
| US-401 | AC-401 | View map | ☐ |
| US-403 | AC-403 | Audio playback | ☐ |
| US-404 | AC-404 | Auto-trigger | ☐ |
| US-405 | AC-601 | Language | ☐ |
| US-409 | AC-602 | Offline | ☐ |
| **US-801** | **AC-701** | **Shop Owner Registration** | ☐ |
| **US-803** | **AC-702** | **Shop Owner POI Mgmt** | ☐ |
| **US-805** | **AC-703** | **Shop Owner Analytics** | ☐ |

---

> **Reference:** `PRDs/00_requirements_intake.md`, `04_user_stories.md`
