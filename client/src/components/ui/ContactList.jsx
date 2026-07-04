import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";
import { Phone, Mail, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useSelector } from "react-redux";

export default function ContactList() {
  const account = useSelector((state) => state.account);
  const contacts = account.contacts;
  const navigation = useNavigate();
  let maleIcon = 0;
  let femaleIcon = 0;
  const femaleNames = ["Sarah", "Sophie", "Emily", "Rachel"];

  return (
    <div className="w-full py-4 flex justify-center text-left">
      <div className="w-full max-w-[1200px] bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Table className="w-full rounded-2xl overflow-hidden">
            <TableHeader className="bg-slate-950/60 border-b border-slate-900">
              <TableRow className="hover:bg-transparent border-slate-900">
                <TableHead className="w-[300px] text-slate-400 font-semibold py-4">
                  Name & Title
                </TableHead>
                <TableHead className="w-[250px] text-slate-400 font-semibold py-4">
                  Contact Info
                </TableHead>
                <TableHead className="w-[300px] text-slate-400 font-semibold py-4">
                  Company & Dept
                </TableHead>
                <TableHead className="w-[300px] text-slate-400 font-semibold py-4">
                  Location & Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-t-0">
              {contacts.map((contact) => {
                let avatar;
                if (femaleNames.includes(contact.FIRST_NAME)) {
                  avatar = `/avatarf${femaleIcon % 2}.jpg`;
                  femaleIcon++;
                } else {
                  avatar = `/avatarm${maleIcon % 3}.jpg`;
                  maleIcon++;
                }

                return (
                  <TableRow
                    key={contact.ID}
                    className="hover:bg-slate-950/30 transition-all duration-150 border-b border-slate-900/50 hover:cursor-pointer"
                    onClick={() =>
                      navigation("/contact", {
                        state: { contact, account, avatar },
                      })
                    }
                  >
                    <TableCell className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border border-slate-800">
                          <AvatarImage src={avatar} />
                          <AvatarFallback className="bg-slate-800 text-cyan-400 font-bold">
                            {contact.FIRST_NAME[0]}
                            {contact.LAST_NAME[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <div className="font-semibold text-slate-100 text-sm">
                            {contact.FIRST_NAME} {contact.LAST_NAME}
                          </div>
                          <div className="text-xs text-slate-400 font-light mt-0.5">
                            {contact.TITLE}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-1.5 text-slate-300">
                        {contact.PHONE && (
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            {contact.PHONE}
                          </div>
                        )}
                        {contact.MOBILE_PHONE && (
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            {contact.MOBILE_PHONE}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          {contact.EMAIL}
                        </div>
                        {!contact.PHONE &&
                          !contact.MOBILE_PHONE &&
                          !contact.EMAIL && (
                            <div className="text-xs text-slate-500 italic">
                              No contact details
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-1 text-slate-300">
                        {contact.DEPARTMENT && (
                          <div className="text-xs font-semibold">
                            {contact.DEPARTMENT}
                          </div>
                        )}
                        {contact.LEAD_SOURCE && (
                          <div className="text-xs text-slate-400 font-light">
                            {contact.LEAD_SOURCE}
                          </div>
                        )}
                        {!contact.DEPARTMENT && !contact.LEAD_SOURCE && (
                          <div className="text-xs text-slate-500 italic">
                            No company details
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-2 text-slate-300">
                        <div className="flex items-start gap-2 text-xs">
                          {contact.MAILING_CITY && (
                            <>
                              <MapPin className="h-3.5 w-3.5 text-slate-500 mt-0.5" />
                              <span className="font-light">
                                {contact.MAILING_CITY},{" "}
                                {contact.MAILING_STATE},{" "}
                                {contact.MAILING_COUNTRY}
                              </span>
                            </>
                          )}
                          {!contact.MAILING_CITY && (
                            <span className="text-xs text-slate-500 italic">
                              No location details
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[10px] font-semibold py-0.5 px-2 rounded-full border ${
                              contact.CLEAN_STATUS === "Verified"
                                ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/40"
                                : contact.CLEAN_STATUS === "Invalid"
                                ? "bg-red-950/40 text-red-400 border-red-900/40"
                                : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}
                          >
                            {contact.CLEAN_STATUS}
                          </Badge>
                          {contact.IS_PRIORITY_RECORD && (
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden p-3 space-y-3">
          {contacts.map((contact) => {
            let avatar;
            if (femaleNames.includes(contact.FIRST_NAME)) {
              avatar = `/avatarf${femaleIcon % 2}.jpg`;
              femaleIcon++;
            } else {
              avatar = `/avatarm${maleIcon % 3}.jpg`;
              maleIcon++;
            }

            return (
              <div
                key={contact.ID}
                className="bg-slate-950/30 border border-slate-900 rounded-2xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer"
                onClick={() =>
                  navigation("/contact", {
                    state: { contact, account, avatar },
                  })
                }
              >
                <div className="flex items-center space-x-4 mb-3">
                  <Avatar className="h-12 w-12 border border-slate-800">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-slate-800 text-cyan-400 font-bold">
                      {contact.FIRST_NAME[0]}
                      {contact.LAST_NAME[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <div className="font-semibold text-slate-100 text-sm">
                      {contact.FIRST_NAME} {contact.LAST_NAME}
                    </div>
                    <div className="text-xs text-slate-400 font-light">{contact.TITLE}</div>
                  </div>
                </div>
                
                <div className="text-slate-300 text-xs space-y-2 pt-2 border-t border-slate-900/50 text-left">
                  {contact.PHONE && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      {contact.PHONE}
                    </div>
                  )}
                  {contact.MOBILE_PHONE && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      {contact.MOBILE_PHONE}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    {contact.EMAIL}
                  </div>
                  {contact.MAILING_CITY && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {contact.MAILING_CITY}, {contact.MAILING_STATE},{" "}
                      {contact.MAILING_COUNTRY}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      className={`text-[10px] font-semibold py-0.5 px-2 rounded-full border ${
                        contact.CLEAN_STATUS === "Verified"
                          ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/40"
                          : contact.CLEAN_STATUS === "Invalid"
                          ? "bg-red-950/40 text-red-400 border-red-900/40"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {contact.CLEAN_STATUS}
                    </Badge>
                    {contact.IS_PRIORITY_RECORD && (
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
