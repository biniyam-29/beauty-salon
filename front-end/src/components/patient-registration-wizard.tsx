import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Checkbox } from "./ui/checkbox"
import { Switch } from "./ui/switch"
import { Progress } from "./ui/progress"
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from "@heroicons/react/24/outline"
import { cn } from "../lib/utils"

interface PatientData {
  // Personal Information
  firstName: string
  lastName: string
  dateOfBirth: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  emergencyPhone: string

  // Skin Health Check
  skinType: string
  skinSensitivity: string
  currentSkinCondition: string

  // Skin Care History
  currentProducts: string[]
  previousTreatments: string[]
  allergies: string[]

  // Skin Concerns
  primaryConcerns: string[]
  concernDuration: string
  previouslyTreated: boolean

  // Health History
  medications: string
  medicalConditions: string[]
  pregnancyStatus: string
  lifestyle: {
    smoking: boolean
    alcohol: boolean
    sunExposure: string
    exercise: string
  }

  // Files
  profilePicture: File | null
  signature: string
}

const initialData: PatientData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  skinType: "",
  skinSensitivity: "",
  currentSkinCondition: "",
  currentProducts: [],
  previousTreatments: [],
  allergies: [],
  primaryConcerns: [],
  concernDuration: "",
  previouslyTreated: false,
  medications: "",
  medicalConditions: [],
  pregnancyStatus: "",
  lifestyle: {
    smoking: false,
    alcohol: false,
    sunExposure: "",
    exercise: "",
  },
  profilePicture: null,
  signature: "",
}

const steps = [
  { id: 1, name: "Personal Info", title: "Personal Information" },
  { id: 2, name: "Skin Health", title: "Skin Health Check" },
  { id: 3, name: "Skin Care", title: "Skin Care History" },
  { id: 4, name: "Concerns", title: "Skin Concerns" },
  { id: 5, name: "Health", title: "Health History" },
  { id: 6, name: "Complete", title: "Complete Registration" },
]

export function PatientRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PatientData>(initialData)

  const updateFormData = (updates: Partial<PatientData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // In production, this would submit to your backend API
    console.log("Submitting patient data:", formData)
    alert("Patient registered successfully!")
  }

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                    currentStep > step.id
                      ? "bg-teal-600 text-white"
                      : currentStep === step.id
                        ? "bg-teal-100 text-teal-600 border-2 border-teal-600"
                        : "bg-gray-200 text-gray-500",
                  )}
                >
                  {currentStep > step.id ? <CheckIcon className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={cn("ml-2 text-sm font-medium", currentStep >= step.id ? "text-gray-900" : "text-gray-500")}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && <div className="w-12 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 && <PersonalInfoStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <SkinHealthStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <SkinCareHistoryStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <SkinConcernsStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 5 && <HealthHistoryStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 6 && <CompleteRegistrationStep formData={formData} updateFormData={updateFormData} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {currentStep < steps.length ? (
          <Button onClick={nextStep} className="bg-teal-600 hover:bg-teal-700">
            Next
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
            Complete Registration
          </Button>
        )}
      </div>
    </div>
  )
}

function PersonalInfoStep({
  formData,
  updateFormData,
}: { formData: PatientData; updateFormData: (updates: Partial<PatientData>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name *</Label>
        <Input
          id="firstName"
          value={formData.firstName}
          onChange={(e) => updateFormData({ firstName: e.target.value })}
          placeholder="Enter first name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={(e) => updateFormData({ lastName: e.target.value })}
          placeholder="Enter last name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          placeholder="Enter email address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          value={formData.emergencyContact}
          onChange={(e) => updateFormData({ emergencyContact: e.target.value })}
          placeholder="Emergency contact name"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
          placeholder="Enter full address"
          rows={3}
        />
      </div>
    </div>
  )
}

function SkinHealthStep({
  formData,
  updateFormData,
}: { formData: PatientData; updateFormData: (updates: Partial<PatientData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">What is your skin type?</Label>
        <RadioGroup
          value={formData.skinType}
          onValueChange={(value) => updateFormData({ skinType: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {["Normal", "Dry", "Oily", "Combination", "Sensitive", "Mature"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <RadioGroupItem value={type} id={type} />
              <Label htmlFor={type}>{type}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">How sensitive is your skin?</Label>
        <RadioGroup
          value={formData.skinSensitivity}
          onValueChange={(value) => updateFormData({ skinSensitivity: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {["Not sensitive", "Moderately sensitive", "Very sensitive"].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <RadioGroupItem value={level} id={level} />
              <Label htmlFor={level}>{level}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentCondition">Current Skin Condition</Label>
        <Textarea
          id="currentCondition"
          value={formData.currentSkinCondition}
          onChange={(e) => updateFormData({ currentSkinCondition: e.target.value })}
          placeholder="Describe your current skin condition, any visible issues, etc."
          rows={4}
        />
      </div>
    </div>
  )
}

function SkinCareHistoryStep({
  formData,
  updateFormData,
}: { formData: PatientData; updateFormData: (updates: Partial<PatientData>) => void }) {
  const productOptions = [
    "Cleanser",
    "Moisturizer",
    "Sunscreen",
    "Serum",
    "Toner",
    "Exfoliant",
    "Retinoid",
    "Vitamin C",
    "Other",
  ]

  const treatmentOptions = [
    "Chemical Peel",
    "Microdermabrasion",
    "Laser Treatment",
    "IPL",
    "Botox",
    "Fillers",
    "Facials",
    "Other",
  ]

  const allergyOptions = [
    "Fragrances",
    "Parabens",
    "Sulfates",
    "Salicylic Acid",
    "Benzoyl Peroxide",
    "Retinoids",
    "Alpha Hydroxy Acids",
    "Other",
  ]

  const handleCheckboxChange = (
    category: keyof Pick<PatientData, "currentProducts" | "previousTreatments" | "allergies">,
    value: string,
    checked: boolean,
  ) => {
    const currentArray = formData[category] as string[]
    const updatedArray = checked ? [...currentArray, value] : currentArray.filter((item) => item !== value)

    updateFormData({ [category]: updatedArray })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">Current Skincare Products (check all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {productOptions.map((product) => (
            <div key={product} className="flex items-center space-x-2">
              <Checkbox
                id={`product-${product}`}
                checked={formData.currentProducts.includes(product)}
                onCheckedChange={(checked) => handleCheckboxChange("currentProducts", product, checked as boolean)}
              />
              <Label htmlFor={`product-${product}`} className="text-sm">
                {product}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Previous Treatments (check all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {treatmentOptions.map((treatment) => (
            <div key={treatment} className="flex items-center space-x-2">
              <Checkbox
                id={`treatment-${treatment}`}
                checked={formData.previousTreatments.includes(treatment)}
                onCheckedChange={(checked) => handleCheckboxChange("previousTreatments", treatment, checked as boolean)}
              />
              <Label htmlFor={`treatment-${treatment}`} className="text-sm">
                {treatment}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Known Allergies or Sensitivities</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allergyOptions.map((allergy) => (
            <div key={allergy} className="flex items-center space-x-2">
              <Checkbox
                id={`allergy-${allergy}`}
                checked={formData.allergies.includes(allergy)}
                onCheckedChange={(checked) => handleCheckboxChange("allergies", allergy, checked as boolean)}
              />
              <Label htmlFor={`allergy-${allergy}`} className="text-sm">
                {allergy}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkinConcernsStep({
  formData,
  updateFormData,
}: { formData: PatientData; updateFormData: (updates: Partial<PatientData>) => void }) {
  const concernOptions = [
    "Acne",
    "Wrinkles",
    "Dark Spots",
    "Uneven Skin Tone",
    "Large Pores",
    "Dryness",
    "Oiliness",
    "Redness",
    "Sensitivity",
    "Scarring",
    "Sun Damage",
    "Other",
  ]

  const handleConcernChange = (concern: string, checked: boolean) => {
    const updatedConcerns = checked
      ? [...formData.primaryConcerns, concern]
      : formData.primaryConcerns.filter((item) => item !== concern)

    updateFormData({ primaryConcerns: updatedConcerns })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">Primary Skin Concerns (check all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {concernOptions.map((concern) => (
            <div key={concern} className="flex items-center space-x-2">
              <Checkbox
                id={`concern-${concern}`}
                checked={formData.primaryConcerns.includes(concern)}
                onCheckedChange={(checked) => handleConcernChange(concern, checked as boolean)}
              />
              <Label htmlFor={`concern-${concern}`} className="text-sm">
                {concern}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">How long have you had these concerns?</Label>
        <RadioGroup
          value={formData.concernDuration}
          onValueChange={(value) => updateFormData({ concernDuration: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {["Less than 6 months", "6 months - 1 year", "1-2 years", "2-5 years", "More than 5 years"].map(
            (duration) => (
              <div key={duration} className="flex items-center space-x-2">
                <RadioGroupItem value={duration} id={duration} />
                <Label htmlFor={duration}>{duration}</Label>
              </div>
            ),
          )}
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="previouslyTreated"
          checked={formData.previouslyTreated}
          onCheckedChange={(checked) => updateFormData({ previouslyTreated: checked })}
        />
        <Label htmlFor="previouslyTreated">Have you previously sought treatment for these concerns?</Label>
      </div>
    </div>
  )
}

function HealthHistoryStep({
  formData,
  updateFormData,
}: { formData: PatientData; updateFormData: (updates: Partial<PatientData>) => void }) {
  const medicalConditions = [
    "Diabetes",
    "High Blood Pressure",
    "Heart Disease",
    "Autoimmune Disorder",
    "Hormonal Imbalance",
    "Thyroid Issues",
    "Cancer History",
    "Other",
  ]

  const handleConditionChange = (condition: string, checked: boolean) => {
    const updatedConditions = checked
      ? [...formData.medicalConditions, condition]
      : formData.medicalConditions.filter((item) => item !== condition)

    updateFormData({ medicalConditions: updatedConditions })
  }

  const updateLifestyle = (key: keyof PatientData["lifestyle"], value: any) => {
    updateFormData({
      lifestyle: {
        ...formData.lifestyle,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          value={formData.medications}
          onChange={(e) => updateFormData({ medications: e.target.value })}
          placeholder="List all current medications, supplements, and dosages"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Medical Conditions (check all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {medicalConditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${condition}`}
                checked={formData.medicalConditions.includes(condition)}
                onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
              />
              <Label htmlFor={`condition-${condition}`} className="text-sm">
                {condition}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Pregnancy Status (if applicable)</Label>
        <RadioGroup
          value={formData.pregnancyStatus}
          onValueChange={(value) => updateFormData({ pregnancyStatus: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {["Not applicable", "Not pregnant", "Pregnant", "Breastfeeding"].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <RadioGroupItem value={status} id={status} />
              <Label htmlFor={status}>{status}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Lifestyle Factors</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="smoking">Do you smoke?</Label>
            <Switch
              id="smoking"
              checked={formData.lifestyle.smoking}
              onCheckedChange={(checked) => updateLifestyle("smoking", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="alcohol">Do you consume alcohol regularly?</Label>
            <Switch
              id="alcohol"
              checked={formData.lifestyle.alcohol}
              onCheckedChange={(checked) => updateLifestyle("alcohol", checked)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Sun Exposure Level</Label>
            <RadioGroup
              value={formData.lifestyle.sunExposure}
              onValueChange={(value) => updateLifestyle("sunExposure", value)}
            >
              {["Minimal", "Moderate", "High"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <RadioGroupItem value={level} id={`sun-${level}`} />
                  <Label htmlFor={`sun-${level}`}>{level}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Exercise Frequency</Label>
            <RadioGroup
              value={formData.lifestyle.exercise}
              onValueChange={(value) => updateLifestyle("exercise", value)}
            >
              {["Rarely", "1-2 times/week", "3-4 times/week", "Daily"].map((freq) => (
                <div key={freq} className="flex items-center space-x-2">
                  <RadioGroupItem value={freq} id={`exercise-${freq}`} />
                  <Label htmlFor={`exercise-${freq}`}>{freq}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompleteRegistrationStep({
  formData,
  updateFormData,
}: { formData: PatientData; updateFormData: (updates: Partial<PatientData>) => void }) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateFormData({ profilePicture: file })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">Profile Picture (Optional)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="profile-picture" />
          <Label htmlFor="profile-picture" className="cursor-pointer">
            <div className="space-y-2">
              <div className="text-gray-500">
                {formData.profilePicture ? (
                  <p>Selected: {formData.profilePicture.name}</p>
                ) : (
                  <p>Click to upload profile picture</p>
                )}
              </div>
              <Button type="button" variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Digital Signature</Label>
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded h-32 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Digital signature capture would be implemented here</p>
          </div>
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm">
              Clear Signature
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Registration Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Patient:</strong> {formData.firstName} {formData.lastName}
          </p>
          <p>
            <strong>Date of Birth:</strong> {formData.dateOfBirth}
          </p>
          <p>
            <strong>Phone:</strong> {formData.phone}
          </p>
          <p>
            <strong>Skin Type:</strong> {formData.skinType}
          </p>
          <p>
            <strong>Primary Concerns:</strong> {formData.primaryConcerns.join(", ") || "None specified"}
          </p>
        </div>
      </div>
    </div>
  )
}
