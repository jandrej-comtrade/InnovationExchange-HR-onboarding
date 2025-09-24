# Frontend Implementation Guide: "Unified Onboarding Hub" for The HR Company

## 1. Component Structure

The MVP frontend is a single-page application (SPA) embedded within the vTiger Customer Portal. It will consist of the following core components:

*   **`OnboardingHubApp` (Root Component):** The main container. Manages routing (if needed), global state, and renders the primary view.
*   **`ProgressTracker`:** A component that visually indicates the user's progress through the form. It will show completed, current, and pending sections.
*   **`DynamicForm`:** The core component. It will render the entire consolidated form. It will be composed of smaller, reusable field components.
    *   `FormSection`: A wrapper for a logical group of fields (e.g., "Company Details," "Leave Policies"). Accepts a `title` and `isComplete` prop to interact with the `ProgressTracker`.
    *   `TextInput`: For text fields (e.g., Company Trading Name, Operating Hours).
    *   `TextareaInput`: For multi-line text (e.g., detailed policy descriptions).
    *   `SelectInput`: For dropdown selections (e.g., selecting days of the week for operating hours).
    *   `FileUpload` (Optional): For document uploads. Will show file name and remove button after selection.
    *   `FormSubmitButton`: A button that submits the entire form. It will be disabled until all required fields are valid.
*   **`ConfirmationModal`:** A modal dialog that appears after successful form submission, thanking the user and providing next steps.
*   **`ErrorBoundary` (Optional but Recommended):** A component to catch and gracefully handle any JavaScript errors in its child components, preventing the entire app from crashing.

**Example: `TextInput` Component (React/TypeScript)**

```tsx
// src/components/TextInput.tsx
import React from 'react';

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string; // Optional error message to display
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = ""
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 block w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TextInput;
```

**Example: ProgressTracker Component Snippet**

```tsx
// Inside ProgressTracker.tsx
const sections = [
  { id: 'company', title: 'Company Details', isComplete: companySectionComplete },
  { id: 'policies', title: 'HR Policies', isComplete: policiesSectionComplete },
  { id: 'review', title: 'Review & Submit', isComplete: false }
];

return (
  <div className="flex mb-6">
    {sections.map((section, index) => (
      <React.Fragment key={section.id}>
        <div className={`flex-1 flex flex-col items-center ${index !== sections.length - 1 ? 'border-r-2' : ''} ${section.isComplete ? 'border-green-500' : 'border-gray-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-1 ${
            section.isComplete ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {section.isComplete ? '✓' : index + 1}
          </div>
          <span className="text-xs text-center">{section.title}</span>
        </div>
      </React.Fragment>
    ))}
  </div>
);
```
## 2. State Management
Given the MVP scope (a single complex form), React Context API combined with the useReducer hook is the most appropriate and lightweight solution. This avoids the complexity of external libraries like Redux for this specific use case.

- OnboardingContext: Will hold the global state for the form.
- State Shape:
```ts
interface OnboardingState {
  // Form Data
  companyTradingName: string;
  operatingHours: string;
  sickLeavePolicy: string;
  annualLeavePolicy: string;
  probationPeriod: string;
  noticePeriodEmployee: string;
  noticePeriodEmployer: string;
  // ... other fields
  supportingDocument: File | null; // For optional upload

  // UI State
  currentSection: 'company' | 'policies' | 'review'; // For multi-step, if implemented
  isSubmitting: boolean;
  submitSuccess: boolean;
  errors: {
    [key: string]: string; // e.g., { companyTradingName: "This field is required" }
  };
}
```

- **Actions**: Define actions like UPDATE_FIELD, SUBMIT_FORM, SUBMIT_SUCCESS, SET_ERROR, SET_CURRENT_SECTION.
- **Reducer**: A function that takes the current state and an action, and returns the new state. It will handle validation logic (e.g., marking a field as required).
- **Data Persistence**: The form state should be saved to localStorage or sessionStorage on every change (onChange), allowing the user to refresh the page without losing their progress. Upon successful submission, clear the storage.

**Example: State Initialization and Context Setup**

```tsx
// src/context/OnboardingContext.tsx
import React, { createContext, useReducer, useContext, useEffect } from 'react';

// Define State and Action types (as above)
type OnboardingAction =
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'SUBMIT_FORM' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SET_ERROR'; field: string; message: string };

const initialState: OnboardingState = {
  companyTradingName: '',
  operatingHours: '',
  // ... initialize other fields
  supportingDocument: null,
  currentSection: 'company',
  isSubmitting: false,
  submitSuccess: false,
  errors: {}
};

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        // Clear error for this field when user types
        errors: { ...state.errors, [action.field]: '' }
      };
    case 'SUBMIT_FORM':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, submitSuccess: true };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message }
      };
    default:
      return state;
  }
};

const OnboardingContext = createContext<{
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
}>({
  state: initialState,
  dispatch: () => null
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('onboardingFormData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore form data fields, not UI state
        dispatch({ type: 'UPDATE_FIELD', field: 'companyTradingName', value: parsed.companyTradingName || '' });
        // ... restore other data fields
      } catch (e) {
        console.error("Failed to parse saved form data");
      }
    }
  }, []);

  // Save to sessionStorage on every state change (debounced for performance)
  useEffect(() => {
    const formData = {
      companyTradingName: state.companyTradingName,
      operatingHours: state.operatingHours,
      // ... other data fields
    };
    sessionStorage.setItem('onboardingFormData', JSON.stringify(formData));
  }, [state.companyTradingName, state.operatingHours /*, ... other fields */]);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
```
## 3. UI/UX Guidelines
The primary goal is to create a clean, professional, and branded experience that replaces the "old-school" email forms.

- Branding:
    - Colors: Use The HR Company's primary brand color for key interactive elements (buttons, active states, progress tracker). Use neutral grays for text and borders. Use green for success states and red for errors.
    - Typography: Use a clean, modern sans-serif font (e.g., Inter, Open Sans, or system default like -apple-system, BlinkMacSystemFont, 'Segoe UI'). Ensure font sizes are readable (minimum 16px for body text).
    - Logo: Place the company logo in the header of the portal page.
- Layout & Spacing:
    - Use ample white space to avoid a cluttered feel.
    - Group related fields under clear section headings using the FormSection component.
    - Ensure consistent padding and margins (e.g., 1rem / 16px).
- Form Design:
    - Clearly mark required fields with an asterisk (*) and red color.
    - Provide helpful placeholder text or tooltips for complex fields.
    - Implement real-time validation (e.g., show an error if a required field is left blank when the user moves to the next field).
    - The submit button should be prominent and disabled until the form is valid.
- Feedback:
    - Show a loading spinner on the submit button while the form is being processed.
    - Display a clear, positive confirmation message upon successful submission.
    - Display clear, specific error messages next to the relevant field if submission fails.

## 4. Page Layouts
The MVP requires essentially one primary page/layout within the vTiger Customer Portal.

- Page: "Unified Onboarding Hub"
    - Header: Simple header with The HR Company logo and a page title (e.g., "Welcome! Complete Your Onboarding").
    - Main Content Area:
        1. Progress Tracker: Positioned at the top, showing the user their progress (e.g., "Step 1 of 3: Company Details").
        2. Dynamic Form: The main body of the page. It will render the current FormSection based on the state. For the MVP, this can be a single, long form, or broken into 2-3 logical sections (Company Info, HR Policies, Review) with "Next" buttons.
        3. Submit Button: A large, primary button at the bottom of the form (or section).
    - Footer: Simple footer with contact information or a link to support, if needed.

**Example: Main Page Layout Structure**

```tsx
 // src/pages/OnboardingHubPage.tsx
 import React from 'react';
 import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
 import ProgressTracker from '../components/ProgressTracker';
 import DynamicForm from '../components/DynamicForm';
 import ConfirmationModal from '../components/ConfirmationModal';

 const OnboardingHubContent = () => {
   const { state, dispatch } = useOnboarding();

   if (state.submitSuccess) {
     return <ConfirmationModal />;
   }

   return (
     <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
       <h1 className="text-2xl font-bold mb-6 text-center">Welcome to The HR Company</h1>
       <p className="text-gray-600 mb-6 text-center">Please complete the form below to finalize your onboarding.</p>

       <ProgressTracker />

       <DynamicForm />

       {/* The DynamicForm component internally handles rendering the submit button */}
     </div>
   );
 };

 const OnboardingHubPage = () => {
   return (
     <OnboardingProvider>
       <OnboardingHubContent />
     </OnboardingProvider>
   );
 };

 export default OnboardingHubPage;
```