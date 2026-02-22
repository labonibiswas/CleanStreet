import Navbar from "@/components/Navbar";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import FormTextarea from "@/components/FormTextarea";
import mapPlaceholder from "@/assets/map-placeholder.png";

const issueTypes = [
  { value: "pothole", label: "Pothole" },
  { value: "garbage", label: "Garbage Dump" },
  { value: "streetlight", label: "Broken Streetlight" },
  { value: "drainage", label: "Drainage Issue" },
  { value: "other", label: "Other" },
];

const priorityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const ReportIssue = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto px-4 py-10" style={{ maxWidth: 900 }}>
        <h1
          className="font-semibold text-center text-foreground mb-8"
          style={{ fontSize: 28 }}
        >
          Report a Civic Issue
        </h1>

        <div
          className="bg-card border border-border"
          style={{ borderRadius: 12, padding: 32 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Issue Details
          </h2>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                id="title"
                label="Issue Title"
                placeholder="Brief description of the issue"
              />
              <FormSelect
                id="type"
                label="Issue Type"
                placeholder="Select Issue Type"
                options={issueTypes}
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormSelect
                id="priority"
                label="Priority Level"
                placeholder="Select priority"
                options={priorityLevels}
              />
              <FormInput
                id="address"
                label="Address"
                placeholder="Enter Street Address"
              />
            </div>

            {/* Row 3 */}
            <FormInput
              id="landmark"
              label="Near by Landmark(Optional)"
              placeholder="eg. Near city hall"
            />

            {/* Row 4 */}
            <FormTextarea
              id="description"
              label="Description"
              placeholder="Describe the issue in detail..."
              rows={4}
            />

            {/* Map Section */}
            <div className="space-y-2 pt-1">
              <h3 className="text-sm text-label font-normal">
                Location on Map
              </h3>
              <div className="rounded-lg overflow-hidden border border-border">
                <img
                  src={mapPlaceholder}
                  alt="Location map"
                  className="w-full h-48 md:h-56 object-cover"
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ReportIssue;
