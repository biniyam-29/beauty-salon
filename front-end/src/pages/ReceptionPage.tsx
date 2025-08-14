import React, { useState, useCallback, useEffect, useMemo } from "react";

// --- Font Import ---
// In a real project, you'd add this to your main index.html file.
const FontLink = () => (
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
);


// --- UI Components (Enhanced for Beauty & TSC) ---

type CardProps = React.PropsWithChildren<{ className?: string, onClick?: () => void }>;
const Card: React.FC<CardProps> = ({ children, className, onClick }) => <div className={`bg-white/80 backdrop-blur-sm shadow-2xl shadow-pink-200/20 rounded-2xl border border-white/20 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}>{children}</div>;
const CardHeader: React.FC<CardProps> = ({ children, className }) => <div className={`p-6 bg-gradient-to-br from-pink-50 to-rose-100/50 border-b border-white/20 ${className}`}>{children}</div>;
const CardTitle: React.FC<CardProps> = ({ children, className }) => <h2 className={`text-2xl font-bold text-pink-900 font-display ${className}`}>{children}</h2>;
const CardContent: React.FC<CardProps> = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;

type ButtonProps = React.PropsWithChildren<{
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md';
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}>;
const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, variant = 'default', size = 'md', className = '', type = 'button' }) => {
    const baseStyles = "font-bold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4";
    const sizeStyles = size === 'sm' ? 'px-4 py-2 text-sm' : 'px-6 py-3';
    const variantStyles = variant === 'outline'
        ? 'border-2 border-pink-300 bg-transparent text-pink-700 hover:bg-pink-100/50 hover:border-pink-400 focus:ring-pink-200'
        : 'bg-gradient-to-br from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 focus:ring-pink-300';
    return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>{children}</button>;
};

const Input: React.FC<React.ComponentProps<'input'>> = (props) => <input {...props} className={`w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all ${props.className}`} />;
const Label: React.FC<React.ComponentProps<'label'>> = (props) => <label {...props} className={`block text-sm font-bold text-gray-600 mb-2 ${props.className}`} />;
const Textarea: React.FC<React.ComponentProps<'textarea'>> = (props) => <textarea {...props} className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all" />;
const RadioGroup: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => <div className={`flex flex-wrap gap-4 ${className}`}>{children}</div>;

type RadioGroupItemProps = React.PropsWithChildren<{
    value: string;
    id: string;
    name: string;
    checked: boolean;
    onChange: () => void;
}>;
const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, id, name, checked, onChange, children }) => (
    <div className="flex items-center">
        <input type="radio" value={value} id={id} name={name} checked={checked} onChange={onChange} className="sr-only" />
        <label htmlFor={id} className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${checked ? 'bg-pink-100 border-pink-500 shadow-inner' : 'bg-gray-50 border-gray-200 hover:border-pink-300'}`}>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-pink-600 bg-pink-600' : 'border-gray-400'}`}>
                {checked && <span className="w-2 h-2 rounded-full bg-white"></span>}
            </span>
            <span className={`ml-3 font-semibold ${checked ? 'text-pink-900' : 'text-gray-700'}`}>{children}</span>
        </label>
    </div>
);

type CheckboxProps = React.PropsWithChildren<{
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}>;
const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onCheckedChange, children }) => (
    <div className="flex items-center">
        <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="sr-only"/>
        <label htmlFor={id} className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${checked ? 'bg-pink-100 border-pink-500 shadow-inner' : 'bg-gray-50 border-gray-200 hover:border-pink-300'}`}>
            <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${checked ? 'bg-pink-600 border-pink-600' : 'border-gray-400'}`}>
                {checked && <CheckIcon className="w-4 h-4 text-white" />}
            </span>
            <span className={`ml-3 font-semibold ${checked ? 'text-pink-900' : 'text-gray-700'}`}>{children}</span>
        </label>
    </div>
);

type SwitchProps = { id: string; checked: boolean; onCheckedChange: (checked: boolean) => void; };
const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange }) => (
    <button type="button" id={id} onClick={() => onCheckedChange(!checked)} className={`${checked ? 'bg-pink-600' : 'bg-gray-300'} relative inline-flex h-7 w-14 items-center rounded-full transition-colors`}>
        <span className={`${checked ? 'translate-x-8' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform`}/>
    </button>
);

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
    <div className={`w-full bg-pink-200/50 rounded-full h-3 ${className}`}>
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${value}%` }}></div>
    </div>
);

const ChevronLeftIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>;
const CheckIcon: React.FC<{className?: string}> = ({className = "w-5 h-5"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');


// --- JSON Server Configuration ---
const dbUrl = "http://localhost:3001/customers";

// --- Data Interfaces and Initial State ---
interface PatientData {
    id?: string; name: string; address: string; phone: string; city: string; dateOfBirth: string; email: string; emergencyContact: string; emergencyPhone: string; heardFrom: string; skinType: string; skinFeel: string[]; sunExposure: string; foundationType: string; skinHeal: string; bruiseEasily: boolean; usedProducts: string[]; otherProducts: string; skinConcerns: string[]; firstFacial: boolean; previousTreatmentLikes: string; treatmentGoal: string; usedRetinoids: boolean; hadFillers: boolean; acneMedication: boolean; acneMedicationDetails: string; healthConditions: string[]; otherConditions: string; knownAllergies: boolean; allergiesDetails?: string; supplements: boolean; supplementsDetails?: string; prescriptionMeds: boolean; prescriptionMedsDetails?: string; alcoholOrSmoke: boolean; signature: string; signatureDate: string;
}

const initialData: PatientData = {
    name: "", address: "", phone: "", city: "", dateOfBirth: "", email: "", emergencyContact: "", emergencyPhone: "", heardFrom: "", skinType: "", skinFeel: [], sunExposure: "", foundationType: "", skinHeal: "", bruiseEasily: false, usedProducts: [], otherProducts: "", skinConcerns: [], firstFacial: true, previousTreatmentLikes: "", treatmentGoal: "", usedRetinoids: false, hadFillers: false, acneMedication: false, acneMedicationDetails: "", healthConditions: [], otherConditions: "", knownAllergies: false, supplements: false, alcoholOrSmoke: false, signature: "", signatureDate: "", prescriptionMeds: false
};

// --- Child Components for Registration Wizard ---
type StepProps = {
    formData: PatientData;
    updateFormData: (updates: Partial<PatientData>) => void;
};

const PersonalInfoStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => updateFormData({ name: e.target.value })} placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => updateFormData({ phone: e.target.value })} placeholder="Enter phone number" disabled/>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={(e) => updateFormData({ address: e.target.value })} placeholder="Enter street address" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={(e) => updateFormData({ city: e.target.value })} placeholder="Enter city" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => updateFormData({ dateOfBirth: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => updateFormData({ email: e.target.value })} placeholder="Enter email address" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => updateFormData({ emergencyContact: e.target.value })} placeholder="Emergency contact name" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={(e) => updateFormData({ emergencyPhone: e.target.value })} placeholder="Emergency contact phone" />
            </div>
        </div>
    );
}

const SkinHealthStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
    const handleCheckboxChange = (value: string, checked: boolean) => {
        const currentArray = formData.skinFeel;
        const updatedArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value);
        updateFormData({ skinFeel: updatedArray });
    };
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Label className="text-base font-bold text-gray-700">What is your skin type?</Label>
                <RadioGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Normal", "Dry", "Oily", "Combo"].map((type) => (
                        <RadioGroupItem key={type} value={type} name="skinType" id={`type-${type}`} checked={formData.skinType === type} onChange={() => updateFormData({ skinType: type })}>{type}</RadioGroupItem>
                    ))}
                </RadioGroup>
            </div>
            <div className="space-y-4">
                <Label className="text-base font-bold text-gray-700">Does your skin feel?</Label>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    {["Flaky", "Redish", "Tight", "Excessive oil"].map((feel) => (
                         <Checkbox key={feel} id={`feel-${feel}`} checked={formData.skinFeel.includes(feel)} onCheckedChange={(checked) => handleCheckboxChange(feel, checked)}>{feel}</Checkbox>
                    ))}
                </div>
            </div>
             <div className="space-y-4">
                <Label className="text-base font-bold text-gray-700">Your exposure to the sun?</Label>
                <RadioGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Never", "Light", "Moderate", "Excessive"].map((exp) => (
                        <RadioGroupItem key={exp} value={exp} name="sunExposure" id={`exp-${exp}`} checked={formData.sunExposure === exp} onChange={() => updateFormData({ sunExposure: exp })}>{exp}</RadioGroupItem>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
}

const SkinCareStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
    const productOptions = ["Facial cleanser", "Sunscreen", "Mask", "Make-up remover", "Bar soap", "Eye product", "Exfoliants", "Face scrub", "Toner", "Moisturizer", "Day cream", "Body scrub", "Serum", "Lip products", "Night cream", "Body lotion", "Face oil"];
    const concernOptions = ["Wrinkles", "Dryness", "Rosacea", "Aging", "Hyperpigmentation", "Melasma", "Dark circle", "Sun damage", "Acne", "Flaky skin", "Milia", "Redness", "Acne scarring", "Psoriasis", "Oily skin", "Sensitivity"];
    
    const handleProductChange = (value: string, checked: boolean) => {
        const currentArray = formData.usedProducts;
        const updatedArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value);
        updateFormData({ usedProducts: updatedArray });
    };
    
    const handleConcernChange = (value: string, checked: boolean) => {
        const currentArray = formData.skinConcerns;
        const updatedArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value);
        updateFormData({ skinConcerns: updatedArray });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Label className="text-base font-bold text-gray-700">Kindly tick your currently used products</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productOptions.map((product) => (
                         <Checkbox key={product} id={`prod-${product}`} checked={formData.usedProducts.includes(product)} onCheckedChange={(checked) => handleProductChange(product, checked)}>{product}</Checkbox>
                    ))}
                </div>
            </div>
             <div className="space-y-4">
                <Label className="text-base font-bold text-gray-700">Tell us your skin concerns</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {concernOptions.map((concern) => (
                         <Checkbox key={concern} id={`concern-${concern}`} checked={formData.skinConcerns.includes(concern)} onCheckedChange={(checked) => handleConcernChange(concern, checked)}>{concern}</Checkbox>
                    ))}
                </div>
            </div>
        </div>
    );
}

const HealthHistoryStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
    const healthOptions = ["Cancer", "Arthritis", "Thyroid condition", "Epilepsy", "High Blood Pressure", "Asthma", "Auto-immune disorders", "Warts", "Diabetes", "Hepatitis", "Low blood pressure", "Insomnia", "Heart Problem", "Migraines", "Pregnant", "Eczema"];
    
    const handleHealthChange = (value: string, checked: boolean) => {
        const currentArray = formData.healthConditions;
        const updatedArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value);
        updateFormData({ healthConditions: updatedArray });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Label className="text-base font-bold text-gray-700">Have you experienced any of these health conditions?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {healthOptions.map((condition) => (
                         <Checkbox key={condition} id={`health-${condition}`} checked={formData.healthConditions.includes(condition)} onCheckedChange={(checked) => handleHealthChange(condition, checked)}>{condition}</Checkbox>
                    ))}
                </div>
            </div>
            <div className="space-y-6">
                <Label className="text-base font-bold text-gray-700">Additional Health Information</Label>
                <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="usedRetinoids" className="mb-0">Used Retin-A, Accutane, etc.?</Label>
                        <Switch id="usedRetinoids" checked={formData.usedRetinoids} onCheckedChange={(checked) => updateFormData({ usedRetinoids: checked })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="acneMedication" className="mb-0">Taken any acne medication before?</Label>
                        <Switch id="acneMedication" checked={formData.acneMedication} onCheckedChange={(checked) => updateFormData({ acneMedication: checked })} />
                    </div>
                    {formData.acneMedication && (
                         <Textarea value={formData.acneMedicationDetails} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData({ acneMedicationDetails: e.target.value })} placeholder="Please share when and which drugs were used" />
                    )}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="alcoholOrSmoke" className="mb-0">Do you drink alcohol or smoke?</Label>
                        <Switch id="alcoholOrSmoke" checked={formData.alcoholOrSmoke} onCheckedChange={(checked) => updateFormData({ alcoholOrSmoke: checked })} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const CompleteRegistrationStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
    return (
        <div className="space-y-6 text-center">
            <div className="bg-pink-50/50 rounded-lg p-6">
                <h3 className="font-display text-xl font-bold text-pink-800 mb-2">Registration Summary</h3>
                <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Patient:</strong> {formData.name || "..."}</p>
                    <p><strong>Phone:</strong> {formData.phone || "..."}</p>
                    <p><strong>Skin Type:</strong> {formData.skinType || "..."}</p>
                    <p><strong>Primary Concerns:</strong> {formData.skinConcerns.join(", ") || "None specified"}</p>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="signature">Client Signature *</Label>
                <Input id="signature" value={formData.signature} onChange={(e) => updateFormData({ signature: e.target.value })} placeholder="Type your full name to sign" className="text-center font-display text-xl" />
            </div>
            <p className="text-xs text-gray-500 max-w-md mx-auto">By signing, you agree that you have completed this form to the best of your knowledge and waive all liabilities for any misrepresentation of your health history.</p>
        </div>
    );
}


// --- The Main Registration Wizard Component ---
type PatientRegistrationWizardProps = {
    phone: string;
    onRegistrationComplete: (newUser: PatientData) => void;
};
const PatientRegistrationWizard: React.FC<PatientRegistrationWizardProps> = ({ phone, onRegistrationComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<PatientData>({ ...initialData, phone });

    const steps = [
        { id: 1, name: "Personal Info", title: "Personal Information", component: PersonalInfoStep },
        { id: 2, name: "Skin Health", title: "Skin Health Check", component: SkinHealthStep },
        { id: 3, name: "Skin Care", title: "Skin Care & Concerns", component: SkinCareStep },
        { id: 4, name: "Health History", title: "Health History", component: HealthHistoryStep },
        { id: 5, name: "Complete", title: "Consent & Completion", component: CompleteRegistrationStep },
    ];

    const updateFormData = (updates: Partial<PatientData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const handleSubmit = async () => {
        console.log("Submitting patient data to json-server:", formData);
        
        const newUser = {
            ...formData,
            signatureDate: new Date().toISOString().split('T')[0]
        };

        try {
            const response = await fetch(dbUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const savedUser = await response.json();
            console.log("User saved:", savedUser);
            onRegistrationComplete(savedUser);
        } catch (error) {
            console.error("Failed to save user:", error);
        }
    };

    const progress = ((currentStep) / (steps.length)) * 100;
    const CurrentStepComponent = steps[currentStep - 1].component;

    return (
        <div className="w-full flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-72 lg:flex-shrink-0">
                 <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl shadow-pink-200/20 p-6 border border-white/20 sticky top-8">
                    <div className="mb-8 text-2xl font-bold text-pink-700 text-center font-display">
                        Registration
                    </div>
                    <ol className="space-y-5">
                        {steps.map((step) => (
                            <li key={step.id} className="flex items-center gap-4">
                                <div className={cn("flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold border-2 transition-all duration-300", currentStep > step.id ? "bg-pink-600 text-white border-pink-600" : currentStep === step.id ? "bg-white text-pink-700 border-pink-600 ring-4 ring-pink-200" : "bg-gray-100 text-gray-400 border-gray-200")}>
                                    {currentStep > step.id ? <CheckIcon className="w-6 h-6" /> : step.id}
                                </div>
                                <span className={cn("text-base font-bold transition-colors", currentStep === step.id ? "text-pink-800" : "text-gray-500")}>{step.name}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-8 pt-8 border-t border-pink-100">
                        <Progress value={progress} />
                    </div>
                </div>
            </aside>
            <main className="flex-1 min-w-0">
                <Card>
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
                    </CardContent>
                </Card>
                <div className="flex justify-between gap-4 mt-8">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}><ChevronLeftIcon /> Previous</Button>
                    {currentStep < steps.length ? (
                        <Button onClick={nextStep}>Next <ChevronRightIcon /></Button>
                    ) : (
                        <Button onClick={handleSubmit}>Complete Registration</Button>
                    )}
                </div>
            </main>
        </div>
    );
}

// --- NEW Reusable Component for Detailed View ---
const CustomerDetailView: React.FC<{user: PatientData}> = ({ user }) => (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center text-pink-600 text-5xl font-bold font-display ring-8 ring-white/50">
                {user.name?.charAt(0)}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-800 font-display">{user.name}</h3>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-gray-500">{user.phone}</p>
            </div>
        </div>
        <div className="border-t border-pink-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-pink-50/70 p-3 rounded-lg"><strong className="text-gray-600 block">Date of Birth:</strong> {user.dateOfBirth}</div>
            <div className="bg-pink-50/70 p-3 rounded-lg"><strong className="text-gray-600 block">Skin Type:</strong> {user.skinType}</div>
            <div className="bg-pink-50/70 p-3 rounded-lg md:col-span-2"><strong className="text-gray-600 block">Primary Concerns:</strong> {user.skinConcerns?.join(', ')}</div>
            <div className="bg-pink-50/70 p-3 rounded-lg"><strong className="text-gray-600 block">Used Products:</strong> {user.usedProducts?.join(', ')}</div>
            <div className="bg-pink-50/70 p-3 rounded-lg"><strong className="text-gray-600 block">Health Conditions:</strong> {user.healthConditions?.join(', ')}</div>
            <div className="bg-pink-50/70 p-3 rounded-lg"><strong className="text-gray-600 block">Smokes/Drinks:</strong> {user.alcoholOrSmoke ? 'Yes' : 'No'}</div>
            <div className="bg-pink-50/70 p-3 rounded-lg"><strong className="text-gray-600 block">Signed On:</strong> {user.signatureDate}</div>
        </div>
    </div>
);


// --- Component to Display User Profile Page ---
type UserProfileProps = {
    user: PatientData;
    onBack: () => void;
};
const UserProfile: React.FC<UserProfileProps> = ({ user, onBack }) => {
    return (
        <Card className="w-full max-w-2xl mx-auto animate-fade-in">
            <CardHeader className="text-center">
                <CardTitle className="text-pink-800">Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
                <CustomerDetailView user={user} />
                 <div className="text-center pt-8 mt-6 border-t border-pink-100">
                    <Button onClick={onBack} variant="outline" size="sm">Check Another Customer</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Component to Check Phone Number ---
type PhoneNumberCheckProps = {
    onCheck: (phone: string) => void;
    isLoading: boolean;
    onViewAll: () => void;
};
const PhoneNumberCheck: React.FC<PhoneNumberCheckProps> = ({ onCheck, isLoading, onViewAll }) => {
    const [phone, setPhone] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (phone.trim()) {
            onCheck(phone.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-pink-800">Customer Lookup</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone-check">Enter Customer's Phone Number</Label>
                            <Input
                                id="phone-check"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g., 555-123-4567"
                                required
                                className="text-center text-lg"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Checking..." : "Check Phone Number"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Button onClick={onViewAll} variant="outline" size="sm">View All Customers</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- NEW Modal Component for Customer Details ---
type CustomerDetailModalProps = {
    customer: PatientData;
    onClose: () => void;
};
const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose }) => {
    // Handle key press for accessibility
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader className="flex justify-between items-center sticky top-0 z-10">
                    <CardTitle className="text-pink-800">Customer Details</CardTitle>
                    <button onClick={onClose} className="text-gray-400 hover:text-pink-600 transition-colors text-3xl leading-none">&times;</button>
                </CardHeader>
                <CardContent className="p-8">
                    <CustomerDetailView user={customer} />
                </CardContent>
            </div>
        </div>
    );
};


// --- Component to List All Customers ---
type CustomerListProps = {
    onBack: () => void;
};
const CustomerList: React.FC<CustomerListProps> = ({ onBack }) => {
    const [customers, setCustomers] = useState<PatientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<PatientData | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch(dbUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch customers from the server.');
                }
                const data: PatientData[] = await response.json();
                setCustomers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() =>
        customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
        ), [customers, searchTerm]);

    if (isLoading) {
        return <div className="text-center text-pink-700 font-bold">Loading customers...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 font-bold">Error: {error}</div>;
    }

    return (
        <div className="w-full animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-display text-pink-900">All Customers</h1>
                <Button onClick={onBack} variant="outline">Back to Lookup</Button>
            </div>
            <div className="mb-8">
                <Input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            {filteredCustomers.length === 0 ? (
                <Card className="text-center">
                    <CardContent>
                        <p className="py-12 text-gray-500 font-semibold">No customers found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map(customer => (
                        <Card key={customer.id} onClick={() => setSelectedCustomer(customer)} className="transition-transform duration-300 hover:scale-105 hover:shadow-pink-300/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-200 rounded-full flex items-center justify-center text-pink-600 text-2xl font-bold font-display">
                                        {customer.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-display text-gray-800">{customer.name}</h3>
                                        <p className="text-sm text-gray-500">{customer.phone}</p>
                                        <p className="text-sm text-gray-500">{customer.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {selectedCustomer && (
                <CustomerDetailModal 
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}
        </div>
    );
};


// --- Main App Component to Control the Flow ---
export default function App() {
    const [view, setView] = useState<'phone_check' | 'register' | 'profile' | 'list'>('phone_check');
    const [isLoading, setIsLoading] = useState(false);
    const [checkedPhone, setCheckedPhone] = useState('');
    const [currentUser, setCurrentUser] = useState<PatientData | null>(null);

    const handlePhoneCheck = useCallback(async (phone: string) => {
        setIsLoading(true);
        setCheckedPhone(phone);
        
        try {
            const response = await fetch(`${dbUrl}?phone=${phone}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data: PatientData[] = await response.json();

            if (data.length > 0) {
                setCurrentUser(data[0]);
                setView('profile');
            } else {
                setView('register');
            }
        } catch (error) {
            console.error("Failed to fetch customer:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRegistrationComplete = useCallback((newUser: PatientData) => {
        setCurrentUser(newUser);
        setView('profile');
    }, []);
    
    const resetFlow = useCallback(() => {
        setView('phone_check');
        setCurrentUser(null);
        setCheckedPhone('');
    }, []);

    const renderView = () => {
        const key = view + (currentUser ? currentUser.id : ''); 
        switch (view) {
            case 'profile':
                return currentUser && <div key={key} className="animate-fade-in"><UserProfile user={currentUser} onBack={resetFlow} /></div>;
            case 'register':
                return <div key={key} className="animate-fade-in"><PatientRegistrationWizard phone={checkedPhone} onRegistrationComplete={handleRegistrationComplete} /></div>;
            case 'list':
                return <div key={key} className="animate-fade-in"><CustomerList onBack={resetFlow} /></div>;
            case 'phone_check':
            default:
                return <div key={key} className="animate-fade-in"><PhoneNumberCheck onCheck={handlePhoneCheck} isLoading={isLoading} onViewAll={() => setView('list')} /></div>;
        }
    };

    return (
        <>
            <FontLink />
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 min-h-screen p-4 sm:p-6 md:p-8 font-sans text-gray-800">
                <div className="max-w-7xl mx-auto">
                    {renderView()}
                </div>
            </div>
            <style>{`
                .font-display { font-family: 'Playfair Display', serif; }
                .font-sans { font-family: 'Lato', sans-serif; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-fast { animation: fadeInFast 0.2s ease-out forwards; }
                @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
                .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
            `}</style>
        </>
    );
}
