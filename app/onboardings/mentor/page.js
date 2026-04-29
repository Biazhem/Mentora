// app/mentor-onboarding/page.jsx
'use client';

import { useState } from 'react';
import { 
  User, Mail, Phone, School, GraduationCap, Calendar, MapPin, 
  FileText, Upload, X, Globe, Code, Briefcase, Building, 
  Award, Plus, Trash2, CheckCircle, AlertCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function MentorOnboardingPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    program: '',
    programCustom: '',
    degree: '',
    dateOfBirth: '',
    address: '',
    bio: '',
    cv: null,
    website: '',
    skills: [],
    currentSkill: '',
    experiences: [],
    currentJob: '',
    currentCompany: '',
    yearsOfExperience: '',
  });

  const [cvFileName, setCvFileName] = useState('');
  const [slug, setSlug] = useState('');
  const [emailError, setEmailError] = useState('');
  const [skillError, setSkillError] = useState('');

  const programs = [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Mathematics',
    'Physics',
    'Biology',
    'Psychology',
    'Economics',
    'Other'
  ];

  const degrees = [
    'Bachelor of Science (B.Sc)',
    'Bachelor of Arts (B.A)',
    'Bachelor of Engineering (B.E)',
    'Master of Science (M.Sc)',
    'Master of Arts (M.A)',
    'Master of Business Administration (MBA)',
    'PhD',
    'Diploma',
    'Certificate'
  ];

  const validateInstitutionEmail = (email) => {
    const prohibitedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'protonmail.com'];
    const emailDomain = email.split('@')[1];
    
    if (!emailDomain) return false;
    
    if (prohibitedDomains.includes(emailDomain.toLowerCase())) {
      setEmailError('Please use your institutional email (.edu, .ac, or company email)');
      return false;
    }
    
    // Check if it's an institutional email (.edu, .ac, or custom domain)
    if (emailDomain.includes('.edu') || emailDomain.includes('.ac') || emailDomain.length > 4) {
      setEmailError('');
      return true;
    }
    
    setEmailError('Please use a valid institutional email address');
    return false;
  };

  const generateSlug = (firstName, lastName) => {
    const randomId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const slugValue = `mentor-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomId}`;
    setSlug(slugValue);
    return slugValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'email') {
        validateInstitutionEmail(value);
      }
      
      if (name === 'firstName' || name === 'lastName') {
        if (newData.firstName && newData.lastName) {
          generateSlug(newData.firstName, newData.lastName);
        }
      }
      
      return newData;
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'program' && value !== 'Other') {
      setFormData(prev => ({ ...prev, programCustom: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, cv: file }));
      setCvFileName(file.name);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleRemoveCV = () => {
    setFormData(prev => ({ ...prev, cv: null }));
    setCvFileName('');
  };

  // Skills Management
  const handleAddSkill = () => {
    const skill = formData.currentSkill.trim();
    if (skill && !formData.skills.includes(skill)) {
      if (formData.skills.length < 20) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skill],
          currentSkill: ''
        }));
        setSkillError('');
      } else {
        setSkillError('Maximum 20 skills allowed');
      }
    } else if (formData.skills.includes(skill)) {
      setSkillError('Skill already added');
    } else {
      setSkillError('Please enter a skill');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Experience Management
  const handleAddExperience = () => {
    if (formData.currentJob && formData.currentCompany) {
      const newExperience = {
        id: Date.now(),
        title: formData.currentJob,
        company: formData.currentCompany,
        years: formData.yearsOfExperience || 'Present'
      };
      setFormData(prev => ({
        ...prev,
        experiences: [...prev.experiences, newExperience],
        currentJob: '',
        currentCompany: '',
        yearsOfExperience: ''
      }));
    } else {
      alert('Please fill in both job title and company');
    }
  };

  const handleRemoveExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const validateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateInstitutionEmail(formData.email)) {
      alert('Please use a valid institutional email address');
      return;
    }
    
    // Validate date of birth
    if (formData.dateOfBirth) {
      const age = validateAge(formData.dateOfBirth);
      if (age < 18) {
        alert('Mentor must be at least 18 years old');
        return;
      }
      if (age > 100) {
        alert('Please enter a valid date of birth');
        return;
      }
    }
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.degree) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate skills
    if (formData.skills.length === 0) {
      alert('Please add at least one skill');
      return;
    }
    
    // Get final program value
    const finalProgram = formData.program === 'Other' ? formData.programCustom : formData.program;
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      program: finalProgram,
      slug: slug,
      fullName: `${formData.firstName} ${formData.lastName}`,
      cvFile: formData.cv ? formData.cv.name : null,
      submittedAt: new Date().toISOString(),
      role: 'mentor'
    };
    
    console.log('Mentor Onboarding Data:', submissionData);
    console.log('Generated Slug:', slug);
    console.log('Skills:', formData.skills);
    console.log('Experiences:', formData.experiences);
    
    alert(`Mentor profile created successfully!\nSlug: ${slug}\nSkills: ${formData.skills.length}\nExperience: ${formData.experiences.length}`);
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      program: '',
      programCustom: '',
      degree: '',
      dateOfBirth: '',
      address: '',
      bio: '',
      cv: null,
      website: '',
      skills: [],
      currentSkill: '',
      experiences: [],
      currentJob: '',
      currentCompany: '',
      yearsOfExperience: '',
    });
    setCvFileName('');
    setSlug('');
    setEmailError('');
    setSkillError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-16 h-16 mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 bg-clip-text text-transparent">
            Mentor Onboarding
          </h1>
          <p className="text-slate-600 mt-2">Share your expertise and guide the next generation</p>
        </div>

        {/* Slug Display */}
        {slug && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800 font-medium">
              Your Mentor Profile Slug: <span className="font-mono">{slug}</span>
            </p>
            <p className="text-xs text-purple-600 mt-1">Share this slug with students to connect with you</p>
          </div>
        )}

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="pl-10"
                      placeholder="Enter first name"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="pl-10"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email - Institutional Only */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Institutional Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`pl-10 ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="mentor@institution.edu"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {emailError}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Use your .edu, .ac, or company email address</p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="pl-10"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium">
                    Personal/Professional Website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Program with Custom Input */}
                <div className="space-y-2">
                  <Label htmlFor="program" className="text-sm font-medium">
                    Program/Specialization
                  </Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Select
                      value={formData.program}
                      onValueChange={(value) => handleSelectChange('program', value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Program Input */}
                {formData.program === 'Other' && (
                  <div className="space-y-2">
                    <Label htmlFor="programCustom" className="text-sm font-medium">
                      Specify Program <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="programCustom"
                      name="programCustom"
                      value={formData.programCustom}
                      onChange={handleChange}
                      required={formData.program === 'Other'}
                      placeholder="Enter your program/specialization"
                    />
                  </div>
                )}

                {/* Degree */}
                <div className="space-y-2">
                  <Label htmlFor="degree" className="text-sm font-medium">
                    Highest Degree <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Select
                      value={formData.degree}
                      onValueChange={(value) => handleSelectChange('degree', value)}
                      required
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select Degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {degrees.map((degree) => (
                          <SelectItem key={degree} value={degree}>
                            {degree}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      className="pl-10"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Must be at least 18 years old</p>
                </div>

                {/* Skills Section */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium">
                    Skills & Expertise <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={formData.currentSkill}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentSkill: e.target.value }))}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                        placeholder="e.g., React, Python, Leadership, Communication"
                      />
                    </div>
                    <Button type="button" onClick={handleAddSkill} variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {skillError && (
                    <p className="text-xs text-red-500">{skillError}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Add your technical and soft skills</p>
                </div>

                {/* Current Job Section */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium">
                    Current Position <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={formData.currentJob}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentJob: e.target.value }))}
                        className="pl-10"
                        placeholder="Job Title"
                      />
                    </div>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={formData.currentCompany}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                        className="pl-10"
                        placeholder="Company/Organization"
                      />
                    </div>
                    <div className="relative md:col-span-2">
                      <Input
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                        placeholder="Years of experience (e.g., 3 years, Present)"
                      />
                    </div>
                  </div>
                  <Button type="button" onClick={handleAddExperience} variant="outline" className="mt-2">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Experience
                  </Button>
                </div>

                {/* Experiences List */}
                {formData.experiences.length > 0 && (
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium">Work Experience</Label>
                    <div className="space-y-2">
                      {formData.experiences.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{exp.title}</p>
                            <p className="text-xs text-slate-600">{exp.company} • {exp.years}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Professional Bio <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us about your professional background, teaching philosophy, and what you can offer as a mentor..."
                    className="resize-none"
                  />
                </div>

                {/* CV Upload */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="cv" className="text-sm font-medium">
                    CV/Resume (PDF only)
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          id="cv"
                          name="cv"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                    {cvFileName && (
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{cvFileName}</span>
                        <button
                          type="button"
                          onClick={handleRemoveCV}
                          className="ml-2 hover:bg-green-100 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3 text-green-700" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Upload your professional CV in PDF format</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Mentor Application
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}