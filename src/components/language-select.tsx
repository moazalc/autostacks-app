"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { US, AE } from "country-flag-icons/react/3x2";

export function Language() {
  return (
    <Select>
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="english">
          <US title="United States" className="" />
          EN
        </SelectItem>
        <SelectItem value="arabic">
          <AE title="United Arab Emirates" className="" />
          AE
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
