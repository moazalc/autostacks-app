import React from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Camera } from "lucide-react";

const ProfileCard = () => {
  return (
    <div className="lg:col-span-4">
      <Card className="sticky top-8 w-75 h-85">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src="/placeholder.svg?height=96&width=96"
                  alt="Profile"
                />
                <AvatarFallback className="text-lg font-semibold">
                  SJ
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-bold">Insert Name here</h2>
              <p className="text-muted-foreground">@</p>
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCard;
