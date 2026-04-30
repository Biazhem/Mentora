"use client"

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, School, GraduationCap, Calendar, MapPin, 
  FileText, Upload, X, CheckCircle, ArrowLeft, ArrowRight, Loader2, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  
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
    skills: [],
    experiences: [],
    languages: [],
    currentSkill: '',
    currentLanguage: '',
  });

  const pollJobStatus = async (statusUrl) => {
    const apiKey = process.env.NEXT_PUBLIC_RESUMEAPI;
    
    try {
      const response = await fetch(statusUrl, {
        headers: {
          'apy-token': apiKey
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'success' || (result.data && result.status !== 'processing')) {
        const resumeData = result.data || result;
        
        let fName = formData.firstName;
        let lName = formData.lastName;
        if (resumeData.name) {
          const names = resumeData.name.split(' ');
          fName = names[0] || '';
          lName = names.slice(1).join(' ') || '';
        }

        setFormData(prev => ({
          ...prev,
          firstName: fName || prev.firstName,
          lastName: lName || prev.lastName,
          email: resumeData.email || prev.email,
          phone: resumeData.phone || prev.phone,
          bio: resumeData.bio || prev.bio || (resumeData.about_me) || '',
          degree: resumeData.degree ? (degrees.find(d => d.toLowerCase().includes(resumeData.degree.toLowerCase())) || prev.degree) : prev.degree,
          dateOfBirth: resumeData.dob || prev.dateOfBirth,
          address: resumeData.address || prev.address,
          skills: resumeData.skills ? [...new Set([...prev.skills, ...(Array.isArray(resumeData.skills) ? resumeData.skills : [resumeData.skills])])] : prev.skills,
          languages: resumeData.languages ? [...new Set([...prev.languages, ...(Array.isArray(resumeData.languages) ? resumeData.languages : [resumeData.languages])])] : prev.languages,
          experiences: resumeData.experience ? (Array.isArray(resumeData.experience) ? resumeData.experience : [resumeData.experience]) : prev.experiences,
        }));

        if (fName && lName) {
          generateSlug(fName, lName);
        }

        setIsParsing(false);
      } else if (result.status === 'failed') {
        setParseError('Resume parsing failed. Please fill details manually.');
        setIsParsing(false);
      } else {
        setTimeout(() => pollJobStatus(statusUrl), 2000);
      }
    } catch (error) {
      console.error('Polling error:', error);
      setParseError('Error checking parsing status.');
      setIsParsing(false);
    }
  };

  const handleAddSkill = () => {
    if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill.trim()],
        currentSkill: ''
      }));
    }
  };

  const handleAddLanguage = () => {
    if (formData.currentLanguage.trim() && !formData.languages.includes(formData.currentLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, prev.currentLanguage.trim()],
        currentLanguage: ''
      }));
    }
  };

  const removeSkill = (skill) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  const removeLanguage = (lang) => setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Student profile created: ${slug}`);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 hover:bg-emerald-50 text-emerald-700 font-medium"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Selection
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl w-16 h-16 mb-6 shadow-lg shadow-emerald-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Student Profile</h1>
          <p className="text-slate-500 text-lg">Set up your academic identity and start your journey</p>
        </div>

        {slug && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
            <p className="text-sm text-emerald-800 font-medium">
              Profile Slug: <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 ml-1">{slug}</span>
            </p>
            <Badge variant="outline" className="bg-emerald-100 border-emerald-200 text-emerald-700">Unique ID</Badge>
          </div>
        )}

        {isParsing && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-800 font-medium">Analyzing your resume... Please wait while we fill the form for you.</p>
          </div>
        )}

        {parseError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">{parseError}</p>
          </div>
        )}

        <Card className="shadow-xl border-slate-200/60 overflow-hidden rounded-3xl">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-600 to-teal-500" />
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">First Name *</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} required className="pl-12 h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="John" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Last Name *</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} required className="pl-12 h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Email Address *</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} required className="pl-12 h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="john@university.edu" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Phone Number *</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="pl-12 h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" placeholder="+1 234 567 890" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Program *</Label>
                  <div className="relative group">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Select value={formData.program} onValueChange={(v) => handleSelectChange('program', v)}>
                      <SelectTrigger className="pl-12 h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select Program" /></SelectTrigger>
                      <SelectContent>
                        {programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Highest Degree *</Label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Select value={formData.degree} onValueChange={(v) => handleSelectChange('degree', v)}>
                      <SelectTrigger className="pl-12 h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select Degree" /></SelectTrigger>
                      <SelectContent>
                        {degrees.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.program === 'Other' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-slate-700">Specify Program *</Label>
                    <Input name="programCustom" value={formData.programCustom} onChange={handleChange} required className="h-12 rounded-xl border-slate-200" placeholder="Enter your custom program name" />
                  </div>
                )}

                {/* Skills Section */}
                <div className="md:col-span-2 space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">Skills</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a skill (e.g. React, Python)" 
                      value={formData.currentSkill} 
                      onChange={(e) => setFormData(prev => ({ ...prev, currentSkill: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="rounded-xl border-slate-200"
                    />
                    <Button type="button" onClick={handleAddSkill} variant="secondary" className="rounded-xl">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map(skill => (
                      <Badge key={skill} className="bg-emerald-100 text-emerald-700 border-emerald-200 py-1 px-3 flex items-center gap-2">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => removeSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="md:col-span-2 space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">Languages</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a language (e.g. English, French)" 
                      value={formData.currentLanguage} 
                      onChange={(e) => setFormData(prev => ({ ...prev, currentLanguage: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                      className="rounded-xl border-slate-200"
                    />
                    <Button type="button" onClick={handleAddLanguage} variant="secondary" className="rounded-xl">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map(lang => (
                      <Badge key={lang} className="bg-blue-100 text-blue-700 border-blue-200 py-1 px-3 flex items-center gap-2">
                        {lang}
                        <X className="w-3 h-3 cursor-pointer hover:text-blue-900" onClick={() => removeLanguage(lang)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Experience Preview (Simple list from parser) */}
                {formData.experiences.length > 0 && (
                  <div className="md:col-span-2 space-y-4">
                    <Label className="text-sm font-semibold text-slate-700">Detected Experience</Label>
                    <div className="space-y-3">
                      {formData.experiences.map((exp, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                          <p className="text-sm font-medium text-slate-900">{typeof exp === 'string' ? exp : (exp.title || exp.role)}</p>
                          {exp.company && <p className="text-xs text-slate-500">{exp.company}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Bio</Label>
                  <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none" placeholder="Tell us about your academic interests and career goals..." />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">CV/Resume (PDF only)</Label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${cvFileName ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'}`}>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${cvFileName ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                        {cvFileName ? <CheckCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <p className="text-sm font-medium text-slate-900">{cvFileName || "Click to upload or drag and drop"}</p>
                      <p className="text-xs text-slate-500 mt-1">PDF file up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8 border-t border-slate-100">
                <Button type="submit" disabled={isParsing} className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-200">
                  {isParsing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Complete Registration"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 font-semibold" onClick={() => setFormData({})}>Reset</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}
