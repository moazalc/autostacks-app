import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger  } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectItem } from "../ui/select";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CreditCard, Key, Shield, User } from "lucide-react";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";

const TabSwitcher = () => {
  return (
    <div>
      <Tabs defaultValue="profile" className="space-y-6 ">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arabic">Arabic</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Password</CardTitle>
                <CardDescription>Manage your account password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current">Current Password</Label>
                        <Input id="current" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">New Password</Label>
                        <Input id="new" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm New Password</Label>
                        <Input id="confirm" type="password" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Update Password</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Secure your account with two-factor authentication
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Active Sessions</CardTitle>
                <CardDescription>
                  Manage your active sessions across devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">
                      Chrome on macOS • New York, NY
                    </p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Mobile App</p>
                    <p className="text-sm text-muted-foreground">
                      iOS App • Last seen 2 hours ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Sign Out
                  </Button>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Sign Out All Sessions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Recent Activity</CardTitle>
              <CardDescription>
                Your recent account activity and security events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Successful sign-in</p>
                    <p className="text-sm text-muted-foreground">
                      Chrome on macOS • New York, NY
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Profile updated</p>
                    <p className="text-sm text-muted-foreground">
                      Changed display name and company information
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 day ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Payment method updated</p>
                    <p className="text-sm text-muted-foreground">
                      Added new credit card ending in 4242
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      3 days ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabSwitcher;
