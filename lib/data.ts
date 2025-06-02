export interface WebShell {
  id: string
  name: string
  type: string
  description: string
  url: string
  tags: string[]
  lastUpdated: string
}

export const webShells: WebShell[] = [
  {
    id: "1",
    name: "b374k Shell",
    type: "php",
    description:
      "PHP Shell with firewall bypass capabilities and multiple features including file manager, terminal emulation, and database access.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/b374k.php",
    tags: ["PHP", "File Manager", "Terminal", "Database"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "2",
    name: "WSO Shell",
    type: "php",
    description:
      "Web Shell by Orb, a powerful PHP shell with file management, command execution, and database management capabilities.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/wso.php",
    tags: ["PHP", "File Manager", "Command Execution"],
    lastUpdated: "2023-10-22",
  },
  {
    id: "3",
    name: "C99 Shell",
    type: "php",
    description:
      "Classic PHP shell with extensive features including file management, command execution, and network tools.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/c99.php",
    tags: ["PHP", "File Manager", "Network Tools"],
    lastUpdated: "2023-09-18",
  },
  {
    id: "4",
    name: "R57 Shell",
    type: "php",
    description:
      "Powerful PHP shell with multiple features including file operations, command execution, and SQL tools.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/r57.php",
    tags: ["PHP", "SQL", "Command Execution"],
    lastUpdated: "2023-08-30",
  },
  {
    id: "5",
    name: "China Chopper",
    type: "aspx",
    description: "Minimalistic ASPX web shell with a small footprint, designed to evade detection.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/chopper.aspx",
    tags: ["ASPX", "Stealth", "Minimal"],
    lastUpdated: "2023-11-05",
  },
  {
    id: "6",
    name: "ASPXSpy",
    type: "aspx",
    description: "Advanced ASPX web shell with comprehensive system information gathering and file management.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/aspxspy.aspx",
    tags: ["ASPX", "System Info", "File Manager"],
    lastUpdated: "2023-10-12",
  },
  {
    id: "7",
    name: "JSP Shell",
    type: "jsp",
    description: "Java Server Pages web shell with command execution and file management capabilities.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/shell.jsp",
    tags: ["JSP", "Command Execution", "File Manager"],
    lastUpdated: "2023-09-25",
  },
  {
    id: "8",
    name: "JspSpy",
    type: "jsp",
    description: "Advanced JSP web shell with database management, file operations, and command execution.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/jspspy.jsp",
    tags: ["JSP", "Database", "Command Execution"],
    lastUpdated: "2023-11-10",
  },
  {
    id: "9",
    name: "Weevely",
    type: "php",
    description: "Stealth PHP web shell that can be password protected and has a small footprint.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/weevely.php",
    tags: ["PHP", "Stealth", "Password Protected"],
    lastUpdated: "2023-10-05",
  },
  {
    id: "10",
    name: "Simple Backdoor",
    type: "php",
    description: "Minimalistic PHP backdoor with command execution capabilities.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/simple-backdoor.php",
    tags: ["PHP", "Minimal", "Command Execution"],
    lastUpdated: "2023-08-15",
  },
  {
    id: "11",
    name: "ASPX Command Shell",
    type: "aspx",
    description: "Simple ASPX shell focused on command execution with minimal interface.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/cmd.aspx",
    tags: ["ASPX", "Command Execution", "Minimal"],
    lastUpdated: "2023-07-20",
  },
  {
    id: "12",
    name: "PHP Bypass Shell",
    type: "php",
    description: "PHP shell designed to bypass common security restrictions and WAFs.",
    url: "https://github.com/sagsooz/Bypass-Webshell/blob/main/bypass.php",
    tags: ["PHP", "WAF Bypass", "Security Evasion"],
    lastUpdated: "2023-11-18",
  },
]
