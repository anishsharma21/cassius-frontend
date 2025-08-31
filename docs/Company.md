# Company Module Documentation

## Overview

The Company module is a core feature in Cassius AI that manages business information, file uploads, and company context. It provides a comprehensive interface for users to manage their company profile and upload business documents that are used by the AI to understand and grow their business.

## User Experience

### Company Registration Flow

1. **During Sign-up**: Users provide initial company information
   - Option 1: Provide website URL (AI extracts company info automatically)
   - Option 2: Manual entry (if no website exists):
     - Company name
     - Company description  
     - Target market

2. **Company Profile Page**: After registration, users can:
   - View comprehensive company details
   - Edit company profile with marketing-focused fields
   - Upload business documents (PDF, DOCX, XLSX, TXT)
   - Manage uploaded files (view, delete)

### Company Profile Editing Flow

1. **View Mode**: Users see a clean, organized display of their business information
2. **Edit Profile**: Click the "Edit Profile" button to enter edit mode
3. **Comprehensive Form**: Fill out detailed marketing-focused fields:
   - **Core Business** - What the company does
   - **Value Proposition** - Unique selling points
   - **Products/Services** - Main offerings
   - **Key Differentiators** - Competitive advantages
   - **Company Stage** - Business maturity (dropdown selection)
   - **Industry/Vertical** - Business sector
   - **Business Goals** - Growth objectives
   - **Pain Points Solved** - Customer problems addressed
   - **Target Market** - Ideal customers
   - **Website URL** - Company website
4. **Save Changes**: All fields are combined into a structured format and saved
5. **Immediate AI Enhancement**: Updated information immediately improves all AI features

### Key User Benefits

- **Automated Business Understanding**: AI analyzes website content to understand the business
- **Comprehensive Business Profiling**: Detailed marketing-focused fields for complete business context
- **Enhanced AI Performance**: Rich business information improves all AI-powered features
- **Document Intelligence**: Upload important business documents for AI to reference
- **Centralized Management**: Single location for all business information
- **Real-time Updates**: Optimistic UI updates for seamless profile and file management
- **Secure Storage**: Files stored in AWS S3 with proper access controls

## Frontend Architecture

### Component Structure

```plaintext
src/pages/CompanyProfile/
├── CompanyProfile.jsx      # Main component
├── components/
│   ├── FileTile.jsx        # Individual file display component
│   ├── FileUploadModal.jsx # File upload interface
│   └── index.js            # Component exports
└── index.js                # Page export
```

### Main Components

#### `CompanyProfile.jsx`

The main container component that manages company data and file operations.

**Key Features:**

- React Query for data fetching and caching
- **Edit/View Mode Toggle** - Switch between display and editing states
- **Marketing-Focused Form Fields** - Comprehensive business profiling
- **Structured Data Processing** - Combines form fields into backend-compatible format
- Optimistic UI updates for file operations
- Loading skeletons for better UX
- Error handling and recovery

**State Management:**

```javascript
- company data (via React Query)
- companyFiles list (via React Query)
- isEditMode (edit/view mode toggle)
- isSaving (save operation loading state)
- formData (comprehensive business profile fields)
- isUploadModalOpen (local state)
- deletingFiles Set (tracks files being deleted)
- isFirstLoad (controls skeleton display)
```

**Form Fields:**

The component manages an extensive set of marketing-focused fields:

```javascript
{
  name: string,           // Company name
  coreBusiness: string,   // What the company does
  valueProposition: string, // Unique selling points
  productsServices: string, // Main offerings
  keyDifferentiators: string, // Competitive advantages
  companyStage: string,   // Business maturity (dropdown)
  industry: string,       // Industry/vertical
  businessGoals: string,  // Growth objectives
  painPointsSolved: string, // Customer problems addressed
  targetMarket: string,   // Ideal customers
  websiteUrl: string      // Company website
}
```

**Data Fetching:**

- Uses React Query with 5-minute stale time
- Caches company data for performance
- Refetch disabled on window focus

#### `FileTile.jsx`

Individual file display component with delete functionality.

**Features:**

- File type detection and icon display
- Formatted file size and upload date
- Delete confirmation modal
- Loading state during deletion

**Props:**

```javascript
{
  fileName: string,
  fileType: string,
  fileSize: string,
  lastUpdated: string,
  iconBgColor: string,
  iconTextColor: string,
  onDelete: function,
  isDeleting: boolean
}
```

#### `FileUploadModal.jsx`

Modal component for uploading multiple files.

**Features:**

- Multiple file selection
- File type validation (PDF, DOCX, XLSX, TXT)
- Progress tracking per file
- Optimistic updates on success
- Error handling with retry capability

**Supported File Types:**

- PDF documents
- Word documents (DOCX)
- Excel spreadsheets (XLSX)
- Text files (TXT)

**Maximum File Size:** 50MB per file

## API Integration

### Endpoints

| Method | Endpoint | Description | Frontend Usage |
|--------|----------|-------------|----------------|
| GET | `/companies/get-company-name` | Get company name | Not directly used in CompanyProfile |
| GET | `/companies/profile` | Get full company profile | CompanyProfile data fetching |
| PUT | `/companies/update-company` | Update company details | Future implementation |
| POST | `/companies/upload-file` | Upload a file to S3 | FileUploadModal |
| GET | `/companies/files` | List all company files | CompanyProfile file list |
| DELETE | `/companies/files/{filename}` | Delete a specific file | FileTile delete action |

### API Configuration

Located in `src/config/api.js`:

```javascript
{
  getCompanyName: `${API_BASE_URL}/companies/get-company-name`,
  companyProfile: `${API_BASE_URL}/companies/profile`,
  updateCompany: `${API_BASE_URL}/companies/update-company`,
  uploadFile: `${API_BASE_URL}/companies/upload-file`,
  getCompanyFiles: `${API_BASE_URL}/companies/files`,
  deleteCompanyFile: `${API_BASE_URL}/companies/files`
}
```

## Backend Integration

### Database Schema

#### `companies` Table

Stores company information and metadata.

```sql
CREATE TABLE companies (
    id VARCHAR PRIMARY KEY,
    website_url VARCHAR,
    name VARCHAR,
    description TEXT,
    target_market VARCHAR,
    file_bucket VARCHAR,         -- AWS S3 bucket name
    llm_website_summary TEXT,     -- AI-generated website analysis
    admin_user_id VARCHAR,        -- Foreign key to users table
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `document_chunks` Table

Stores vectorized document chunks for AI retrieval.

```sql
CREATE TABLE document_chunks (
    id VARCHAR PRIMARY KEY,
    company_id VARCHAR,           -- Foreign key to companies
    file_name VARCHAR(512),
    chunk_index INTEGER,
    text TEXT,
    embedding VECTOR(1536),       -- pgvector for semantic search
    created_at TIMESTAMP
);
```

### Structured Description Format

The frontend combines multiple marketing-focused fields into a structured format stored in the `description` field:

```
BUSINESS PROFILE:
Core Business: [What the company does]
Value Proposition: [Unique selling points]
Products/Services: [Main offerings]
Key Differentiators: [Competitive advantages]
Company Stage: [Business maturity level]
Industry: [Business sector]
Business Goals: [Growth objectives]
Pain Points Solved: [Customer problems addressed]
```

This structured format:
- **Maximizes AI Context**: Provides rich, organized information for all AI features
- **Backward Compatible**: Existing descriptions are preserved and parsed correctly
- **No Schema Changes**: Uses existing database structure
- **Immediate Impact**: Enhanced context available instantly to all AI services

### Backend Services

#### Company Management (`backend/src/features/company/services.py`)

**Key Functions:**

1. **`create_company()`**: Creates new company during signup
   - Fetches and analyzes website content if URL provided
   - Creates AWS S3 bucket for file storage
   - Initiates background tasks for:
     - Reddit subreddit discovery
     - Geographic market analysis
     - Partnership recommendations

2. **`get_company_profile()`**: Returns company details for display

3. **`update_company()`**: Updates company information
   - Processes structured description format
   - Updates company name, description, target_market, website_url
   - Invalidates Redis cache for immediate AI context updates

4. **`upload_file()`**: Handles file upload to S3
   - Validates file size (max 50MB)
   - Checks for duplicate files
   - Uploads to S3 with metadata
   - Triggers background vectorization for AI search

5. **`get_company_files_from_s3()`**: Lists all uploaded files
   - Retrieves from S3 with metadata
   - Formats file information for frontend

6. **`delete_file()`**: Removes file from S3
   - Validates file existence
   - Deletes from S3 bucket
   - Cascades deletion of vectorized chunks

### Background Initialization

When a company is created, several background tasks are initiated:

```python
async def init_company_resources():
    # 1. Initialize Reddit subreddits
    await init_reddit(company_id, business_context)
    
    # 2. Initialize geographic data
    await init_geo(company_id, business_context, website_url)
    
    # 3. Initialize partnerships
    await init_partnerships(business_context, company_id)
    
    # 4. Initialize subreddit discovery
    await init_subreddits_for_company(company_id, business_context)
```

### File Processing Pipeline

1. **Upload**: File uploaded to S3 via `upload_file()`
2. **Chunking**: Background task chunks document into segments
3. **Vectorization**: Each chunk is converted to embeddings using OpenAI
4. **Storage**: Vectors stored in PostgreSQL with pgvector extension
5. **Retrieval**: AI can search documents using semantic similarity

## Data Flow

### Company Creation Flow

```plaintext
User Sign-up → Company Creation → S3 Bucket Creation
                      ↓
            Website Analysis (if URL provided)
                      ↓
            Background Initialization Tasks
                      ↓
            Company Profile Available
```

### File Upload Flow

```plaintext
User Selects Files → Validation → Upload to S3
                                      ↓
                          Optimistic UI Update
                                      ↓
                          Background Vectorization
                                      ↓
                          Available for AI Search
```

### File Deletion Flow

```plaintext
User Clicks Delete → Confirmation Modal → API Call
                                             ↓
                                    Delete from S3
                                             ↓
                                    Update UI Cache
                                             ↓
                              Cascade Delete Vectors
```

## React Query Integration

### Cache Keys

- `['company']`: Company profile data
- `['companyFiles']`: List of uploaded files

### Cache Management

```javascript
// Optimistic update for file upload
queryClient.setQueryData(['companyFiles'], updatedFiles);

// Invalidate company data after changes
queryClient.invalidateQueries(['company']);
```

### Stale Time Configuration

- Company data: 5 minutes
- Company files: 5 minutes
- Refetch on window focus: Disabled

## Security Considerations

1. **Authentication**: All endpoints require Bearer token authentication
2. **User Isolation**: Companies linked to single admin user
3. **File Validation**: Type and size restrictions enforced
4. **S3 Security**: Private buckets with controlled access
5. **SQL Injection Prevention**: Parameterized queries via SQLAlchemy

## Error Handling

### Frontend Error States

1. **Network Errors**: Display error message with retry option
2. **Upload Failures**: Show specific error per file, allow retry
3. **Delete Failures**: Keep modal open, show error message
4. **Profile Update Failures**: Show error alert, maintain edit mode
5. **Auth Failures**: Redirect to login if token expired

### Backend Error Responses

```python
# Standard error format
{
    "detail": "Error message"
}

# HTTP Status Codes
- 400: Bad Request (validation errors)
- 401: Unauthorized (auth failures)
- 404: Not Found (resource missing)
- 500: Internal Server Error
```

## Performance Optimizations

1. **Optimistic Updates**: UI updates before server confirmation
2. **React Query Caching**: Reduces unnecessary API calls
3. **Structured Data Processing**: Efficient field combination on frontend
4. **Lazy Loading**: Files loaded on demand
5. **Skeleton Loaders**: Better perceived performance
6. **Background Processing**: File vectorization doesn't block UI
7. **Immediate Cache Invalidation**: Redis cache updated instantly after profile changes

## Future Enhancements

### Planned Features

1. ✅ **Company Editing**: **IMPLEMENTED**
   - ✅ Edit/view mode toggle
   - ✅ Marketing-focused form fields
   - ✅ Structured data format
   - ✅ Real-time validation
   - Future: Auto-save functionality

2. **File Preview**:
   - In-browser PDF viewing
   - Document text preview
   - Search within documents

3. **Advanced Upload**:
   - Drag-and-drop interface
   - Folder upload support
   - Upload progress bar

4. **Analytics**:
   - File usage statistics
   - AI query tracking
   - Document relevance scoring

5. **Collaboration**:
   - Multi-user access
   - File sharing permissions
   - Activity logs

### Technical Improvements

1. **WebSocket Integration**: Real-time file processing status
2. **Service Worker**: Offline file caching
3. **Compression**: Client-side file compression before upload
4. **Batch Operations**: Multiple file deletion
5. **Search**: Full-text search across uploaded documents

## Testing Considerations

### Unit Tests

- Component rendering
- File validation logic
- Error handling paths
- Date/size formatting utilities

### Integration Tests

- File upload flow
- Delete confirmation flow
- API error handling
- Cache updates

### E2E Tests

- Complete signup → company creation flow
- File upload → view → delete cycle
- Error recovery scenarios

## Accessibility

- Keyboard navigation support
- ARIA labels for interactive elements
- Focus management in modals
- Screen reader friendly file information
- Color contrast compliance

---

*This documentation provides a comprehensive overview of the Company module implementation, from user interface to backend integration.*
