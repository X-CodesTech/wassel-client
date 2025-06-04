import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
});

export default function DesignSystem() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const ComponentSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );

  const CodeBlock = ({ code }: { code: string }) => (
    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
      <code>{code}</code>
    </pre>
  );

  const PropTable = ({
    props,
  }: {
    props: Array<{
      name: string;
      type: string;
      default?: string;
      description: string;
    }>;
  }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prop</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((prop, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-sm">{prop.name}</TableCell>
              <TableCell className="font-mono text-sm text-blue-600">
                {prop.type}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {prop.default || "-"}
              </TableCell>
              <TableCell>{prop.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Design System
        </h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive documentation of all UI components used in the Fleet
          Management System
        </p>
      </div>

      <Tabs defaultValue="foundations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="foundations">
          <div className="space-y-8">
            <ComponentSection title="Colors">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-16 bg-blue-600 rounded-md"></div>
                  <p className="text-sm font-medium">Primary Blue</p>
                  <p className="text-xs text-gray-500">#2563eb</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-yellow-400 rounded-md"></div>
                  <p className="text-sm font-medium">Accent Yellow</p>
                  <p className="text-xs text-gray-500">#facc15</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-green-500 rounded-md"></div>
                  <p className="text-sm font-medium">Success Green</p>
                  <p className="text-xs text-gray-500">#10b981</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-red-500 rounded-md"></div>
                  <p className="text-sm font-medium">Error Red</p>
                  <p className="text-xs text-gray-500">#ef4444</p>
                </div>
              </div>
            </ComponentSection>

            <ComponentSection title="Typography">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold">Heading 1</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    text-4xl font-bold
                  </p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Heading 2</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    text-3xl font-bold
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Heading 3</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    text-2xl font-bold
                  </p>
                </div>
                <div>
                  <p className="text-base">
                    Body text - Regular paragraph content
                  </p>
                  <p className="text-sm text-gray-500 mt-1">text-base</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Muted text - Secondary information
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    text-sm text-muted-foreground
                  </p>
                </div>
              </div>
            </ComponentSection>

            <ComponentSection title="Spacing">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-600"></div>
                  <span>1rem (16px) - Standard spacing</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-blue-600"></div>
                  <span>1.5rem (24px) - Medium spacing</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600"></div>
                  <span>2rem (32px) - Large spacing</span>
                </div>
              </div>
            </ComponentSection>
          </div>
        </TabsContent>

        <TabsContent value="components">
          <div className="space-y-8">
            <ComponentSection title="Button Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">With Icons</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Button variant="default" size="md">
  Click me
</Button>

<Button variant="outline">
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>`}
                  />
                </div>

                <PropTable
                  props={[
                    {
                      name: "variant",
                      type: "string",
                      default: "default",
                      description: "Button style variant",
                    },
                    {
                      name: "size",
                      type: "string",
                      default: "default",
                      description: "Button size",
                    },
                    {
                      name: "disabled",
                      type: "boolean",
                      default: "false",
                      description: "Disable the button",
                    },
                    {
                      name: "onClick",
                      type: "function",
                      description: "Click handler function",
                    },
                  ]}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Badge Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-4">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge className="bg-green-100 text-green-800">
                      Success
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Badge variant="default">Active</Badge>
<Badge className="bg-green-100 text-green-800">Success</Badge>`}
                  />
                </div>

                <PropTable
                  props={[
                    {
                      name: "variant",
                      type: "string",
                      default: "default",
                      description: "Badge style variant",
                    },
                    {
                      name: "className",
                      type: "string",
                      description: "Additional CSS classes",
                    },
                  ]}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Avatar Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Examples</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-500 text-white">
                        AB
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-green-500 text-white text-lg">
                        CD
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`}
                  />
                </div>

                <PropTable
                  props={[
                    {
                      name: "className",
                      type: "string",
                      description: "Additional CSS classes for sizing",
                    },
                    {
                      name: "src",
                      type: "string",
                      description: "Image source URL",
                    },
                    {
                      name: "alt",
                      type: "string",
                      description: "Alt text for image",
                    },
                  ]}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Card Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Basic Card</h4>
                  <Card className="max-w-md">
                    <CardHeader>
                      <CardTitle>Card Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        This is the card content area where you can place any
                        content.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>`}
                  />
                </div>

                <PropTable
                  props={[
                    {
                      name: "className",
                      type: "string",
                      description: "Additional CSS classes",
                    },
                  ]}
                />
              </div>
            </ComponentSection>
          </div>
        </TabsContent>

        <TabsContent value="forms">
          <div className="space-y-8">
            <ComponentSection title="Input Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Input Types</h4>
                  <div className="space-y-4 max-w-md">
                    <Input type="text" placeholder="Text input" />
                    <Input type="email" placeholder="Email input" />
                    <Input type="password" placeholder="Password input" />
                    <Input type="number" placeholder="Number input" />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password with toggle"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Input 
  type="text" 
  placeholder="Enter text" 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`}
                  />
                </div>

                <PropTable
                  props={[
                    {
                      name: "type",
                      type: "string",
                      default: "text",
                      description: "Input type (text, email, password, etc.)",
                    },
                    {
                      name: "placeholder",
                      type: "string",
                      description: "Placeholder text",
                    },
                    {
                      name: "value",
                      type: "string",
                      description: "Input value",
                    },
                    {
                      name: "onChange",
                      type: "function",
                      description: "Change handler function",
                    },
                  ]}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Select Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Basic Select</h4>
                  <div className="max-w-md">
                    <Select
                      value={selectedValue}
                      onValueChange={setSelectedValue}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>`}
                  />
                </div>

                <PropTable
                  props={[
                    {
                      name: "value",
                      type: "string",
                      description: "Selected value",
                    },
                    {
                      name: "onValueChange",
                      type: "function",
                      description: "Value change handler",
                    },
                    {
                      name: "placeholder",
                      type: "string",
                      description: "Placeholder text",
                    },
                  ]}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Form Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Complete Form Example</h4>
                  <div className="max-w-md">
                    <Form {...form}>
                      <form className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">Submit</Button>
                      </form>
                    </Form>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "", email: "" }
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>`}
                  />
                </div>
              </div>
            </ComponentSection>
          </div>
        </TabsContent>

        <TabsContent value="layout">
          <div className="space-y-8">
            <ComponentSection title="Table Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Basic Table</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>John Doe</TableCell>
                        <TableCell>john@example.com</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
                  />
                </div>
              </div>
            </ComponentSection>

            <ComponentSection title="Dialog Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Modal Dialog</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Dialog Title</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>
                          This is the dialog content. You can place any content
                          here.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>`}
                  />
                </div>
              </div>
            </ComponentSection>

            <ComponentSection title="Tabs Component">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Tab Navigation</h4>
                  <Tabs defaultValue="tab1" className="max-w-md">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">
                      <p>Content for Tab 1</p>
                    </TabsContent>
                    <TabsContent value="tab2">
                      <p>Content for Tab 2</p>
                    </TabsContent>
                    <TabsContent value="tab3">
                      <p>Content for Tab 3</p>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage</h4>
                  <CodeBlock
                    code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Tab 1 content
  </TabsContent>
  <TabsContent value="tab2">
    Tab 2 content
  </TabsContent>
</Tabs>`}
                  />
                </div>
              </div>
            </ComponentSection>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
