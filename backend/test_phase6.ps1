$BaseUrl = "http://127.0.0.1:5000"
$Pass = 0
$Fail = 0
$Results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Body = $null,
        [string]$Token = $null,
        [int]$ExpectedStatus = 200,
        [switch]$Raw
    )
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = $Url
        Method = $Method
        Headers = $headers
        UseBasicParsing = $true
    }
    
    if ($Body -and $Method -ne "GET") {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            try { $content = $errBody | ConvertFrom-Json } catch { $content = @{ error = $errBody } }
        } else {
            $script:Fail++
            $script:Results += [PSCustomObject]@{ Name=$Name; Status="FAIL"; Code="ERR"; Detail=$_.Exception.Message }
            Write-Host "  FAIL  $Name - $($_.Exception.Message)" -ForegroundColor Red
            return $null
        }
    }
    
    if ($statusCode -eq $ExpectedStatus) {
        $script:Pass++
        $script:Results += [PSCustomObject]@{ Name=$Name; Status="PASS"; Code=$statusCode; Detail="" }
        Write-Host "  PASS  [$statusCode] $Name" -ForegroundColor Green
    } else {
        $script:Fail++
        $detail = ""
        if ($content -and $content.message) { $detail = $content.message }
        $script:Results += [PSCustomObject]@{ Name=$Name; Status="FAIL"; Code=$statusCode; Detail=$detail }
        Write-Host "  FAIL  [$statusCode != $ExpectedStatus] $Name - $detail" -ForegroundColor Red
    }
    
    if ($Raw) { return $content }
    return $content
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  PHASE 6: API ENDPOINT TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ── 1. AUTH ENDPOINTS ──
Write-Host "`n--- AUTH ---" -ForegroundColor Yellow

# Register a test user
$ts = Get-Date -Format "yyyyMMddHHmmss"
$regResult = Test-Endpoint -Name "POST /api/auth/register (user)" -Method POST -Url "$BaseUrl/api/auth/register" -Body @{
    email = "testuser_$ts@example.com"
    password = "test1234"
    name = "Phase6 TestUser"
    phone = "9876543210"
    role = "USER"
} -ExpectedStatus 201
$userToken = $null
if ($regResult -and $regResult.token) { $userToken = $regResult.token }

# Register an agent
$agentRegResult = Test-Endpoint -Name "POST /api/auth/register (agent)" -Method POST -Url "$BaseUrl/api/auth/register" -Body @{
    email = "testagent_$ts@example.com"
    password = "test1234"
    name = "Phase6 TestAgent"
    phone = "9876543211"
    role = "AGENT"
} -ExpectedStatus 201
$agentToken = $null
if ($agentRegResult -and $agentRegResult.token) { $agentToken = $agentRegResult.token }

# Login as existing super admin
$loginResult = Test-Endpoint -Name "POST /api/auth/login (super_admin)" -Method POST -Url "$BaseUrl/api/auth/login" -Body @{
    email = "rootadmin"
    password = "admin123"
} -ExpectedStatus 200
$adminToken = $null
if ($loginResult -and $loginResult.token) { $adminToken = $loginResult.token }

# Login as regular user
$userLogin = Test-Endpoint -Name "POST /api/auth/login (user)" -Method POST -Url "$BaseUrl/api/auth/login" -Body @{
    email = "testuser_$ts@example.com"
    password = "test1234"
} -ExpectedStatus 200

# Duplicate email registration should fail
Test-Endpoint -Name "POST /api/auth/register (duplicate)" -Method POST -Url "$BaseUrl/api/auth/register" -Body @{
    email = "testuser_$ts@example.com"
    password = "test1234"
    role = "USER"
} -ExpectedStatus 400

# Wrong password login should fail
Test-Endpoint -Name "POST /api/auth/login (wrong pwd)" -Method POST -Url "$BaseUrl/api/auth/login" -Body @{
    email = "testuser_$ts@example.com"
    password = "wrongpassword"
} -ExpectedStatus 401

# Missing fields login
Test-Endpoint -Name "POST /api/auth/login (no body)" -Method POST -Url "$BaseUrl/api/auth/login" -Body @{} -ExpectedStatus 400

# Google login (with fake token - should fail gracefully)
Test-Endpoint -Name "POST /api/auth/google-login (bad token)" -Method POST -Url "$BaseUrl/api/auth/google-login" -Body @{
    token = "fake_google_token_12345"
} -ExpectedStatus 401

# OTP send
Test-Endpoint -Name "POST /api/auth/otp/send" -Method POST -Url "$BaseUrl/api/auth/otp/send" -Body @{
    phone = "9876543210"
} -ExpectedStatus 200

# OTP verify (wrong otp)
Test-Endpoint -Name "POST /api/auth/otp/verify (wrong)" -Method POST -Url "$BaseUrl/api/auth/otp/verify" -Body @{
    phone = "9876543210"
    otp = "000000"
} -ExpectedStatus 400

# Refresh token
if ($adminToken -and $loginResult.refreshToken) {
    $refreshResult = Test-Endpoint -Name "POST /api/auth/refresh" -Method POST -Url "$BaseUrl/api/auth/refresh" -Token $loginResult.refreshToken -ExpectedStatus 200
}

# Logout
Test-Endpoint -Name "POST /api/auth/logout" -Method POST -Url "$BaseUrl/api/auth/logout" -Token $adminToken -ExpectedStatus 200

# Dashboard (auth)
if ($adminToken) {
    Test-Endpoint -Name "GET /api/auth/dashboard" -Method GET -Url "$BaseUrl/api/auth/dashboard" -Token $adminToken -ExpectedStatus 200
}

# ── 2. PROPERTIES ENDPOINTS ──
Write-Host "`n--- PROPERTIES ---" -ForegroundColor Yellow

# List properties (public)
$propsList = Test-Endpoint -Name "GET /api/public/properties" -Method GET -Url "$BaseUrl/api/public/properties" -ExpectedStatus 200

# Create a property (no auth needed, optional)
$createdProp = Test-Endpoint -Name "POST /api/properties (create)" -Method POST -Url "$BaseUrl/api/properties" -Body @{
    title = "Phase6 Test Property"
    subtitle = "A test listing"
    description = "A test property for Phase 6 validation"
    price = 5000000
    priceNum = 5000000
    type = "residential"
    category = "Apartment"
    status = "APPROVED"
    bedrooms = 3
    beds = 3
    bathrooms = 2
    area = 1500
    city = "Nashik"
    location = "Nashik, Maharashtra"
    locality = "Test Locality"
    coordinates = @{ lat = 19.9975; lng = 73.7898 }
    images = @("https://example.com/img1.jpg", "https://example.com/img2.jpg")
    amenities = @("Parking", "Gym", "Pool")
    lister_id = "test_lister"
    lister_type = "user"
} -ExpectedStatus 201
$propId = $null
if ($createdProp -and $createdProp.property) { $propId = $createdProp.property.id }

# Get single property
if ($propId) {
    Test-Endpoint -Name "GET /api/properties/$propId" -Method GET -Url "$BaseUrl/api/properties/$propId" -ExpectedStatus 200
}

# Update property
if ($propId) {
    $updatedProp = Test-Endpoint -Name "PUT /api/properties/$propId" -Method PUT -Url "$BaseUrl/api/properties/$propId" -Body @{
        title = "Phase6 Updated Property"
        price = 5500000
    } -Token $adminToken -ExpectedStatus 200
}

# Search properties
Test-Endpoint -Name "GET /api/public/properties (search)" -Method GET -Url "$BaseUrl/api/public/properties" -ExpectedStatus 200

# Featured expiry check
Test-Endpoint -Name "POST /api/properties/expire-featured" -Method POST -Url "$BaseUrl/api/properties/expire-featured" -ExpectedStatus 200

# Track view
if ($propId) {
    Test-Endpoint -Name "PATCH /api/properties/$propId/view" -Method PATCH -Url "$BaseUrl/api/properties/$propId/view" -ExpectedStatus 200
}

# Approve property (admin)
if ($propId) {
    Test-Endpoint -Name "PATCH /api/properties/$propId/approve" -Method PATCH -Url "$BaseUrl/api/properties/$propId/approve" -Token $adminToken -ExpectedStatus 200
}

# Feature property (admin)
if ($propId) {
    Test-Endpoint -Name "PATCH /api/properties/$propId/feature" -Method PATCH -Url "$BaseUrl/api/properties/$propId/feature" -Body @{ featured = $true } -Token $adminToken -ExpectedStatus 200
}

# Reject then re-approve
if ($propId) {
    Test-Endpoint -Name "PATCH /api/properties/$propId/reject" -Method PATCH -Url "$BaseUrl/api/properties/$propId/reject" -Token $adminToken -ExpectedStatus 200
}

# Compare properties
$compareIds = @()
if ($propsList -and $propsList.data) {
    $compareIds = ($propsList.data | Select-Object -First 2 | ForEach-Object { $_.id }) -join ","
}
if ($compareIds) {
    Test-Endpoint -Name "GET /api/properties/compare?ids=$compareIds" -Method GET -Url "$BaseUrl/api/properties/compare?ids=$compareIds" -ExpectedStatus 200
}

# Delete test property
if ($propId) {
    Test-Endpoint -Name "DELETE /api/properties/$propId" -Method DELETE -Url "$BaseUrl/api/properties/$propId" -Token $adminToken -ExpectedStatus 200
}

# ── 3. APPOINTMENTS ENDPOINTS ──
Write-Host "`n--- APPOINTMENTS ---" -ForegroundColor Yellow

# Create appointment
$aptCreated = Test-Endpoint -Name "POST /api/appointments (create)" -Method POST -Url "$BaseUrl/api/appointments" -Body @{
    propertyId = "prop_test"
    propertyTitle = "Test Property"
    date = "2026-08-01"
    time = "10:00 AM"
    userName = "Phase6 TestUser"
    userPhone = "9876543210"
    status = "Pending"
} -Token $userToken -ExpectedStatus 201
$aptId = $null
if ($aptCreated -and $aptCreated.appointment) { $aptId = $aptCreated.appointment.id }

# List all appointments
Test-Endpoint -Name "GET /api/appointments" -Method GET -Url "$BaseUrl/api/appointments" -Token $adminToken -ExpectedStatus 200

# My appointments
Test-Endpoint -Name "GET /api/appointments/my" -Method GET -Url "$BaseUrl/api/appointments/my" -Token $userToken -ExpectedStatus 200

# Get single appointment
if ($aptId) {
    Test-Endpoint -Name "GET /api/appointments/$aptId" -Method GET -Url "$BaseUrl/api/appointments/$aptId" -Token $userToken -ExpectedStatus 200
}

# Update appointment
if ($aptId) {
    Test-Endpoint -Name "PUT /api/appointments/$aptId" -Method PUT -Url "$BaseUrl/api/appointments/$aptId" -Body @{
        status = "Confirmed"
    } -Token $adminToken -ExpectedStatus 200
}

# User cancel own appointment
$cancelApt = Test-Endpoint -Name "POST /api/appointments (for cancel test)" -Method POST -Url "$BaseUrl/api/appointments" -Body @{
    propertyId = "prop_test2"
    date = "2026-08-02"
    status = "Pending"
} -Token $userToken -ExpectedStatus 201
if ($cancelApt -and $cancelApt.appointment) {
    $cancelId = $cancelApt.appointment.id
    Test-Endpoint -Name "PATCH /api/appointments/$cancelId (user cancel)" -Method PATCH -Url "$BaseUrl/api/appointments/$cancelId" -Body @{ status = "Cancelled" } -Token $userToken -ExpectedStatus 200
}

# Delete appointment (admin only)
if ($aptId) {
    Test-Endpoint -Name "DELETE /api/appointments/$aptId" -Method DELETE -Url "$BaseUrl/api/appointments/$aptId" -Token $adminToken -ExpectedStatus 200
}

# ── 4. ADMIN DASHBOARD ──
Write-Host "`n--- ADMIN DASHBOARD ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/admins" -Method GET -Url "$BaseUrl/api/admins" -Token $adminToken -ExpectedStatus 200
Test-Endpoint -Name "GET /api/admins/dashboard" -Method GET -Url "$BaseUrl/api/admins/dashboard" -Token $adminToken -ExpectedStatus 200

# Get admin by ID (use first admin)
if ($adminToken) {
    $adminsList = Invoke-RestMethod -Uri "$BaseUrl/api/admins" -Method GET -Headers @{ Authorization = "Bearer $adminToken"; "Content-Type" = "application/json" } -UseBasicParsing
    if ($adminsList.data -and $adminsList.data.Count -gt 0) {
        $firstAdminId = $adminsList.data[0].id
        Test-Endpoint -Name "GET /api/admins/$firstAdminId" -Method GET -Url "$BaseUrl/api/admins/$firstAdminId" -Token $adminToken -ExpectedStatus 200
    }
}

# ── 5. SUPER ADMIN DASHBOARD ──
Write-Host "`n--- SUPER ADMIN ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/super-admin/dashboard" -Method GET -Url "$BaseUrl/api/super-admin/dashboard" -Token $adminToken -ExpectedStatus 200
Test-Endpoint -Name "GET /api/super-admin/monitoring" -Method GET -Url "$BaseUrl/api/super-admin/monitoring" -Token $adminToken -ExpectedStatus 200
Test-Endpoint -Name "GET /api/super-admin/settings" -Method GET -Url "$BaseUrl/api/super-admin/settings" -Token $adminToken -ExpectedStatus 200

# ── 6. AGENTS ──
Write-Host "`n--- AGENTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/agents" -Method GET -Url "$BaseUrl/api/agents" -Token $adminToken -ExpectedStatus 200
Test-Endpoint -Name "GET /api/agents/dashboard" -Method GET -Url "$BaseUrl/api/agents/dashboard" -Token $adminToken -ExpectedStatus 200

# Create agent
$agentCreated = Test-Endpoint -Name "POST /api/agents (create)" -Method POST -Url "$BaseUrl/api/agents" -Body @{
    name = "Phase6 TestAgent Direct"
    email = "testagent_direct_phase6@example.com"
    phone = "9876543212"
} -Token $adminToken -ExpectedStatus 201
$directAgentId = $null
if ($agentCreated -and $agentCreated.agent) { $directAgentId = $agentCreated.agent.id }

if ($directAgentId) {
    Test-Endpoint -Name "GET /api/agents/$directAgentId" -Method GET -Url "$BaseUrl/api/agents/$directAgentId" -Token $adminToken -ExpectedStatus 200
    
    Test-Endpoint -Name "PUT /api/agents/$directAgentId" -Method PUT -Url "$BaseUrl/api/agents/$directAgentId" -Body @{
        name = "Phase6 Updated Agent"
        sub_area_ids = @()
    } -Token $adminToken -ExpectedStatus 200
    
    Test-Endpoint -Name "DELETE /api/agents/$directAgentId" -Method DELETE -Url "$BaseUrl/api/agents/$directAgentId" -Token $adminToken -ExpectedStatus 200
}

# Agent subareas
Test-Endpoint -Name "GET /api/agents/dashboard (leads)" -Method GET -Url "$BaseUrl/api/agents/leads" -Token $adminToken -ExpectedStatus 200

# Leads CRUD
$leadCreated = Test-Endpoint -Name "POST /api/agents/leads" -Method POST -Url "$BaseUrl/api/agents/leads" -Body @{
    name = "Phase6 Test Lead"
    phone = "9876543299"
    source = "test"
} -Token $adminToken -ExpectedStatus 201
$leadId = $null
if ($leadCreated -and $leadCreated.lead) { $leadId = $leadCreated.lead.id }

if ($leadId) {
    Test-Endpoint -Name "GET /api/agents/leads/$leadId" -Method GET -Url "$BaseUrl/api/agents/leads/$leadId" -Token $adminToken -ExpectedStatus 200
    Test-Endpoint -Name "PATCH /api/agents/leads/$leadId" -Method PATCH -Url "$BaseUrl/api/agents/leads/$leadId" -Body @{ status = "contacted" } -Token $adminToken -ExpectedStatus 200
    Test-Endpoint -Name "DELETE /api/agents/leads/$leadId" -Method DELETE -Url "$BaseUrl/api/agents/leads/$leadId" -Token $adminToken -ExpectedStatus 200
}

# ── 7. SUBAREA SYNC ──
Write-Host "`n--- SUBAREA SYNC ---" -ForegroundColor Yellow

$subareas = Test-Endpoint -Name "GET /api/subareas" -Method GET -Url "$BaseUrl/api/subareas" -ExpectedStatus 200
$testSubareaId = $null
if ($subareas -and $subareas.data -and $subareas.data.Count -gt 0) {
    $testSubareaId = $subareas.data[0].id
}

if ($testSubareaId -and $adminToken) {
    Test-Endpoint -Name "PATCH /api/subareas/$testSubareaId" -Method PATCH -Url "$BaseUrl/api/subareas/$testSubareaId" -Body @{
        agent_ids = @()
    } -Token $adminToken -ExpectedStatus 200
}

# ── 8. CITIES CRUD ──
Write-Host "`n--- CITIES ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/cities" -Method GET -Url "$BaseUrl/api/cities" -ExpectedStatus 200
Test-Endpoint -Name "GET /api/content/cities" -Method GET -Url "$BaseUrl/api/content/cities" -ExpectedStatus 200

# Create city (super admin)
$cityCreated = Test-Endpoint -Name "POST /api/cities (create)" -Method POST -Url "$BaseUrl/api/cities" -Body @{
    name = "Phase6 TestCity"
    image = "https://example.com/city.jpg"
    status = "active"
} -Token $adminToken -ExpectedStatus 201
$cityId = $null
if ($cityCreated -and $cityCreated.city) { $cityId = $cityCreated.city.id }

if ($cityId) {
    Test-Endpoint -Name "PATCH /api/cities/$cityId" -Method PATCH -Url "$BaseUrl/api/cities/$cityId" -Body @{
        name = "Phase6 UpdatedCity"
    } -Token $adminToken -ExpectedStatus 200
}

# ── 9. SUBAREAS CRUD ──
Write-Host "`n--- SUBAREAS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/subareas" -Method GET -Url "$BaseUrl/api/subareas" -ExpectedStatus 200

# ── 10. NOTIFICATIONS ──
Write-Host "`n--- NOTIFICATIONS ---" -ForegroundColor Yellow

# Create notification
$notifCreated = Test-Endpoint -Name "POST /api/notifications (create)" -Method POST -Url "$BaseUrl/api/notifications" -Body @{
    userId = "test_user_id"
    userType = "USER"
    title = "Phase6 Test Notification"
    message = "This is a test notification"
    type = "test"
} -Token $adminToken -ExpectedStatus 201
$notifId = $null
if ($notifCreated -and $notifCreated.notification) { $notifId = $notifCreated.notification.id }

# Get my notifications
Test-Endpoint -Name "GET /api/notifications/my" -Method GET -Url "$BaseUrl/api/notifications/my?userId=test_user_id&userType=USER" -Token $adminToken -ExpectedStatus 200

# Unread count
Test-Endpoint -Name "GET /api/notifications/unread-count" -Method GET -Url "$BaseUrl/api/notifications/unread-count?userId=test_user_id&userType=USER" -Token $adminToken -ExpectedStatus 200

# Mark as read
if ($notifId) {
    Test-Endpoint -Name "PATCH /api/notifications/$notifId/read" -Method PATCH -Url "$BaseUrl/api/notifications/$notifId/read" -Token $adminToken -ExpectedStatus 200
}

# Read all
Test-Endpoint -Name "POST /api/notifications/read-all" -Method POST -Url "$BaseUrl/api/notifications/read-all?userId=test_user_id&userType=USER" -Token $adminToken -ExpectedStatus 200

# ── 11. MESSAGES ──
Write-Host "`n--- MESSAGES ---" -ForegroundColor Yellow

$msgCreated = Test-Endpoint -Name "POST /api/messages (create)" -Method POST -Url "$BaseUrl/api/messages" -Body @{
    from = "test_user_id"
    to = "test_agent_id"
    content = "Phase6 test message"
} -Token $userToken -ExpectedStatus 201
$msgId = $null
if ($msgCreated -and $msgCreated.data) { $msgId = $msgCreated.data.id }

Test-Endpoint -Name "GET /api/messages" -Method GET -Url "$BaseUrl/api/messages" -Token $userToken -ExpectedStatus 200

if ($msgId) {
    Test-Endpoint -Name "GET /api/messages/$msgId" -Method GET -Url "$BaseUrl/api/messages/$msgId" -Token $userToken -ExpectedStatus 200
    Test-Endpoint -Name "PUT /api/messages/$msgId" -Method PUT -Url "$BaseUrl/api/messages/$msgId" -Body @{ read = $true } -Token $userToken -ExpectedStatus 200
    Test-Endpoint -Name "DELETE /api/messages/$msgId" -Method DELETE -Url "$BaseUrl/api/messages/$msgId" -Token $userToken -ExpectedStatus 200
}

# ── 12. ENQUIRIES ──
Write-Host "`n--- ENQUIRIES ---" -ForegroundColor Yellow

$enqCreated = Test-Endpoint -Name "POST /api/enquiries (create)" -Method POST -Url "$BaseUrl/api/enquiries" -Body @{
    name = "Phase6 Enquirer"
    email = "enquirer@example.com"
    phone = "9876543222"
    message = "I want to buy a property"
    propertyId = "prop_test"
} -ExpectedStatus 201
$enqId = $null
if ($enqCreated -and $enqCreated.data) { $enqId = $enqCreated.data.id }

Test-Endpoint -Name "GET /api/enquiries" -Method GET -Url "$BaseUrl/api/enquiries" -Token $adminToken -ExpectedStatus 200

if ($enqId) {
    Test-Endpoint -Name "GET /api/enquiries/$enqId" -Method GET -Url "$BaseUrl/api/enquiries/$enqId" -Token $adminToken -ExpectedStatus 200
    Test-Endpoint -Name "PATCH /api/enquiries/$enqId" -Method PATCH -Url "$BaseUrl/api/enquiries/$enqId" -Body @{ status = "contacted" } -Token $adminToken -ExpectedStatus 200
    Test-Endpoint -Name "DELETE /api/enquiries/$enqId" -Method DELETE -Url "$BaseUrl/api/enquiries/$enqId" -Token $adminToken -ExpectedStatus 200
}

# ── 13. COMPLAINTS ──
Write-Host "`n--- COMPLAINTS ---" -ForegroundColor Yellow

$compCreated = Test-Endpoint -Name "POST /api/complaints (create)" -Method POST -Url "$BaseUrl/api/complaints" -Body @{
    userId = "test_user_id"
    userName = "Phase6 TestUser"
    propertyId = "prop_test"
    propertyTitle = "Test Property"
    subject = "Phase6 Test Complaint"
    description = "This is a test complaint"
    status = "Pending"
} -Token $userToken -ExpectedStatus 201
$compId = $null
if ($compCreated -and $compCreated.complaint) { $compId = $compCreated.complaint.id }

Test-Endpoint -Name "GET /api/complaints" -Method GET -Url "$BaseUrl/api/complaints" -Token $adminToken -ExpectedStatus 200

if ($compId) {
    Test-Endpoint -Name "GET /api/complaints/$compId" -Method GET -Url "$BaseUrl/api/complaints/$compId" -Token $adminToken -ExpectedStatus 200
    Test-Endpoint -Name "PUT /api/complaints/$compId" -Method PUT -Url "$BaseUrl/api/complaints/$compId" -Body @{ status = "Resolved" } -Token $adminToken -ExpectedStatus 200
    Test-Endpoint -Name "DELETE /api/complaints/$compId" -Method DELETE -Url "$BaseUrl/api/complaints/$compId" -Token $adminToken -ExpectedStatus 200
}

# ── 14. CONTENT ENDPOINTS ──
Write-Host "`n--- CONTENT ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /api/content/categories" -Method GET -Url "$BaseUrl/api/content/categories" -ExpectedStatus 200
Test-Endpoint -Name "GET /api/content/testimonials" -Method GET -Url "$BaseUrl/api/content/testimonials" -ExpectedStatus 200
Test-Endpoint -Name "GET /api/content/featured-plans" -Method GET -Url "$BaseUrl/api/content/featured-plans" -ExpectedStatus 200
Test-Endpoint -Name "GET /api/content/properties/featured" -Method GET -Url "$BaseUrl/api/content/properties/featured" -ExpectedStatus 200
Test-Endpoint -Name "GET /api/content/debug/files" -Method GET -Url "$BaseUrl/api/content/debug/files" -ExpectedStatus 200

# ── 15. AUTH DASHBOARD (agent) ──
Write-Host "`n--- AUTH DASHBOARD (agent) ---" -ForegroundColor Yellow
if ($agentToken) {
    Test-Endpoint -Name "GET /api/auth/dashboard (agent)" -Method GET -Url "$BaseUrl/api/auth/dashboard" -Token $agentToken -ExpectedStatus 200
}

# ── SUMMARY ──
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total: $($Pass + $Fail)  |  Pass: $Pass  |  Fail: $Fail" -ForegroundColor $(if ($Fail -eq 0) { "Green" } else { "Red" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($Fail -gt 0) {
    Write-Host "FAILED TESTS:" -ForegroundColor Red
    $Results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name) [$($_.Code)] $($_.Detail)" -ForegroundColor Red
    }
}
