// app/student-profile/page.jsx
'use client';

import { useState } from 'react';
import { User, Mail, Phone, School, GraduationCap, Calendar, MapPin, FileText, Upload, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentProfilePage() {
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
  });

  const [cvFileName, setCvFileName] = useState('');
  const [slug, setSlug] = useState('');

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

  const generateSlug = (firstName, lastName) => {
    const randomId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const slugValue = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomId}`;
    setSlug(slugValue);
    return slugValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Generate slug when first name or last name changes
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
    
    // Clear custom program when a predefined program is selected
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
    
    // Validate date of birth
    if (formData.dateOfBirth) {
      const age = validateAge(formData.dateOfBirth);
      if (age < 16) {
        alert('Student must be at least 16 years old');
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
    
    // Get final program value
    const finalProgram = formData.program === 'Other' ? formData.programCustom : formData.program;
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      program: finalProgram,
      slug: slug,
      fullName: `${formData.firstName} ${formData.lastName}`,
      cvFile: formData.cv ? formData.cv.name : null,
      submittedAt: new Date().toISOString()
    };
    
    console.log('Form Data:', submissionData);
    console.log('Generated Slug:', slug);
    
    // Here you would typically send the data to your backend
    alert(`Profile saved successfully!\nSlug: ${slug}`);
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
    });
    setCvFileName('');
    setSlug('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Student Profile
          </h1>
          <p className="text-slate-500 mt-2">Enter your personal and academic information</p>
        </div>

        {/* Slug Display */}
        {slug && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Your Profile Slug: <span className="font-mono">{slug}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">This slug is generated from your name and unique ID</p>
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

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
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
                      className="pl-10"
                      placeholder="student@university.edu"
                    />
                  </div>
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

                {/* Program with Custom Input */}
                <div className="space-y-2">
                  <Label htmlFor="program" className="text-sm font-medium">
                    Program
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
                      placeholder="Enter your program name"
                    />
                  </div>
                )}

                {/* Degree */}
                <div className="space-y-2">
                  <Label htmlFor="degree" className="text-sm font-medium">
                    Degree <span className="text-red-500">*</span>
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
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="pl-10"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Must be at least 16 years old</p>
                </div>

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
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Short Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself, your interests, and career goals..."
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
                  <p className="text-xs text-slate-500">Upload your CV in PDF format (Max size: 5MB)</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}