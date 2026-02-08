# ✅ Acceptance Criteria
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08  
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

```gherkin
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

## 7. Summary Checklist

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

---

> **Reference:** `PRDs/00_requirements_intake.md`, `04_user_stories.md`
