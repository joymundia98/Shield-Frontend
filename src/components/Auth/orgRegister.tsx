import "./LoginForm.css";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import headerLogo from "../../assets/headerlogo.png";
import { useNavigate } from "react-router-dom";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// ---------------------------
// Validation Schema
// ---------------------------
const orgSchema = z
  .object({
    name: z.string().min(1, "Organization name is required"),
    organization_email: z
      .string()
      .email("Invalid email")
      .min(1, "Email is required"),

    // Updated to use `message`
    organizationType: z.number().min(1, { message: "Organization type is required" }),

    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm password is required"),

    motherBody: z.string().optional(),
    mainDenomination: z.string().min(1, "Main denomination is required"),
    subDenomination: z.string().min(1, "Sub-denomination is required"),
    customSubDenomination: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    region: z.string().min(1, "Region is required"),
    district: z.string().min(1, "District is required"),
    status: z.string().optional(),
    customDistrict: z.string().optional()
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"]
  });


type OrgFormData = z.infer<typeof orgSchema>;

// ---------------------------
// Provinces & Districts
// ---------------------------
const provinceDistrictMap: Record<string, string[]> = {
  "Central Province": ["Chibombo", "Chisamba", "Chitambo", "Kabwe", "Kapiri Mposhi", "Luano", "Mkushi", "Mumbwa", "Ngabwe", "Serenje", "Shibuyunji", "Not Listed"],
  "Copperbelt Province": ["Chililabombwe", "Chingola", "Kalulushi", "Kitwe", "Luanshya", "Lufwanyama", "Masaiti", "Mpongwe", "Mufulira", "Ndola", "Not Listed"],
  "Eastern Province": ["Chadiza", "Chipata", "Katete", "Lundazi", "Mambwe", "Nyimba", "Petauke", "Sinda", "Vubwi", "Not Listed"],
  "Luapula Province": ["Chiengi", "Chembe", "Chipili", "Kawambwa", "Lunga", "Mansa", "Milenge", "Mwansabombwe", "Mwense", "Nchelenge", "Samfya", "Not Listed"],
  "Lusaka Province": ["Lusaka", "Chongwe", "Kafue", "Luangwa", "Chilanga", "Rufunsa", "Not Listed"],
  "Muchinga Province": ["Chama", "Chinsali", "Isoka", "Mafinga", "Mpika", "Nakonde", "Shiwang'andu", "Lavushimanda", "Kanchibiya", "Not Listed"],
  "Northern Province": ["Chilubi", "Kaputa", "Kasama", "Lunte", "Lupososhi", "Luwingu", "Mbala", "Mporokoso", "Mpulungu", "Mungwi", "Nsama", "Senga", "Not Listed"],
  "North-Western Province": ["Chavuma", "Ikelenge", "Kabompo", "Kasempa", "Kalumbila", "Manyinga", "Mufumbwe", "Mushindamo", "Mwinilunga", "Solwezi", "Zambezi", "Not Listed"],
  "Southern Province": ["Chikankata", "Chirundu", "Choma", "Gwembe", "Itezhi-Tezhi", "Kalomo", "Kazungula", "Livingstone", "Mazabuka", "Monze", "Namwala", "Pemba", "Siavonga", "Sinazongwe", "Zimba", "Not Listed"],
  "Western Province": ["Kalabo", "Kaoma", "Limulunga", "Luampa", "Lukulu", "Mitete", "Mongu", "Mulobezi", "Mwandi", "Nalolo", "Nkeyema", "Senanga", "Sesheke", "Shang'ombo", "Sikongo", "Sioma", "Not Listed"]
};

const denominations: Record<string, string[]> = {
  Catholicism: ["Roman Catholic", "Eastern Catholic"],
  Orthodoxy: ["Eastern Orthodox", "Oriental Orthodox"],
  Protestantism: ["Anglican", "Lutheran", "Presbyterian", "Methodist", "Baptist", "Reformed", "Pentecostal", "Non-denominational", "Charismatic", "Not Listed"],
  Evangelical: ["Pentecostal", "Non-denominational", "Charismatic", "Not Listed"],
  Adventist: ["Seventh-day Adventist", "Mormon", "Jehovah's Witnesses", "Not Listed"],
  Anabaptist: ["Mennonite", "Amish", "Hutterites", "Not Listed"],
  Other: ["Quakers", "Salvation Army", "Christian Science", "Unitarian", "Not Listed"]
};

// ---------------------------
// Church Mother Bodies
// ---------------------------
const churchMotherBodies = [
  "Zambia Conference of Catholic Bishops (ZCCB)",
  "Council of Churches in Zambia (CCZ)",
  "Evangelical Fellowship of Zambia (EFZ)",
  "Independent Churches of Zambia (ICOZ)"
];

const OrgRegister = () => {
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [showCustomDistrict, setShowCustomDistrict] = useState(false);
  const [subDenoms, setSubDenoms] = useState<string[]>([]);
  const [showCustomSub, setShowCustomSub] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [orgTypes, setOrgTypes] = useState<{ org_type_id: number; name: string }[]>([]);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema)
  });

  const watchedDistrict = watch("district");
  const watchedMainDenom = watch("mainDenomination");
  const watchedSubDenom = watch("subDenomination");

  useEffect(() => {
    setShowCustomDistrict(watchedDistrict === "Not Listed");
  }, [watchedDistrict]);

  useEffect(() => {
    if (watchedMainDenom) {
      setSubDenoms(denominations[watchedMainDenom] || []);
      setValue("subDenomination", "");
    }
  }, [watchedMainDenom, setValue]);

  useEffect(() => {
    setShowCustomSub(watchedSubDenom === "Not Listed");
  }, [watchedSubDenom]);

  // Fetch organization types from backend
  useEffect(() => {
    const fetchOrgTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/organization_type`);
        setOrgTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch organization types", error);
      }
    };

    fetchOrgTypes();
  }, []);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setDistricts(provinceDistrictMap[province] || []);
  };

  const onSubmit = async (data: OrgFormData) => {
    try {

      const districtToSend =
        data.district === "Not Listed" ? data.customDistrict : data.district;

      const subToSend =
        data.subDenomination === "Not Listed"
          ? data.customSubDenomination
          : data.subDenomination;

      const fullDenomination = `${data.mainDenomination}-${subToSend}`;
      const statusToSend = data.status || "active";

      const response = await axios.post(
        `${baseURL}/api/auth/organizations/register`,
        {
          name: data.name,
          organization_email: data.organization_email, // <-- use this key,
          password: data.password,
          org_type_id: Number(data.organizationType), // <-- convert to number
          denomination: fullDenomination,
          address: data.address,
          region: data.region,
          district: districtToSend,
          status: statusToSend
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      // The response data has the organization object nested inside
    const { id: organizationID, organization_account_id: accountID } = response.data.organization;

      setShowSuccessCard(true);
      setTimeout(() => {
        setShowSuccessCard(false);
        navigate("/Organization/success", {
          state: { organizationID, accountID }
        });
      }, 2000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Organization registration failed"
      );
    }
  };

  return (
    <div className="login-parent-container">
      <div className="loginContainer">
        <div className="header">
          <img src={headerLogo} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Organization Name */}
          <div className="field input-field">
            <input type="text" {...register("name")} />
            <label>Organization Name</label>
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          {/* Organization Email */}
          <div className="field input-field">
            <input type="email" {...register("organization_email")} />
            <label>Organization Email</label>
            {errors.organization_email && (
              <p className="form-error">
                {errors.organization_email.message}
              </p>
            )}
          </div>

          {/* Organization Type */}
          <div className="field input-field select-field">
            <select {...register("organizationType", { valueAsNumber: true })} defaultValue="">
              <option value="" disabled>
                Select Organization Type
              </option>
              {orgTypes.map((type) => (
                <option key={type.org_type_id} value={type.org_type_id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.organizationType && (
              <p className="form-error">{errors.organizationType.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="field input-field">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <label>Password</label>
            <span
              className="showPassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "🙈"}
            </span>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field input-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirm_password")}
            />
            <label>Confirm Password</label>
            <span
              className="showPassword"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? "👁️" : "🙈"}
            </span>
            {errors.confirm_password && (
              <p className="form-error">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Main Denomination */}
          <div className="field input-field select-field">
            <select {...register("mainDenomination")} defaultValue="">
              <option value="" disabled>
                Select Main Denomination
              </option>
              {Object.keys(denominations).map((main) => (
                <option key={main} value={main}>
                  {main}
                </option>
              ))}
            </select>
            {errors.mainDenomination && (
              <p className="form-error">
                {errors.mainDenomination.message}
              </p>
            )}
          </div>

          {/* Sub Denomination */}
          {subDenoms.length > 0 && (
            <div className="field input-field select-field">
              <select {...register("subDenomination")} defaultValue="">
                <option value="" disabled>
                  Select Sub Denomination
                </option>
                {subDenoms.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              {errors.subDenomination && (
                <p className="form-error">
                  {errors.subDenomination.message}
                </p>
              )}
            </div>
          )}

          {/* Church Mother Body */}
          <div className="field input-field select-field">
            <select {...register("motherBody")} defaultValue="">
              <option value="" disabled>
                Select Church Mother Body
              </option>
              {churchMotherBodies.map((body) => (
                <option key={body} value={body}>
                  {body}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Sub Denomination */}
          {showCustomSub && (
            <div className="field input-field">
              <input type="text" {...register("customSubDenomination")} />
              <label>Enter Your Sub-Denomination</label>
            </div>
          )}

          {/* Address */}
          <div className="field input-field">
            <input type="text" {...register("address")} />
            <label>Address</label>
            {errors.address && (
              <p className="form-error">{errors.address.message}</p>
            )}
          </div>

          {/* Province */}
          <div className="field input-field select-field">
            <select
              {...register("region")}
              onChange={handleProvinceChange}
              defaultValue=""
            >
              <option value="" disabled>
                Select Province
              </option>
              {Object.keys(provinceDistrictMap).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.region && (
              <p className="form-error">{errors.region.message}</p>
            )}
          </div>

          {/* District */}
          {selectedProvince && (
            <div className="field input-field select-field">
              <select {...register("district")} defaultValue="">
                <option value="" disabled>
                  Select District
                </option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="form-error">{errors.district.message}</p>
              )}
            </div>
          )}

          {/* Custom District */}
          {showCustomDistrict && (
            <div className="field input-field">
              <input type="text" {...register("customDistrict")} />
              <label>Enter Your District</label>
            </div>
          )}

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <div className="field button-field">
            <button type="submit">Register Organization</button>
          </div>

          <div className="form-link sign-up">
            <span>Already Registered &nbsp;</span>
            <a href="/org-login">Login</a>
          </div>
        </form>
      </div>

      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Organization Created!</h3>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  );
};

export default OrgRegister;
