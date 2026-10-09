// .form-control / .form-select din Bootstrap 5 și suprascrierile din main.css
// (.appointment .php-email-form … și .contact .php-email-form …).

/** .form-control din Bootstrap, nemodificat (contact: select-ul și telefonul) */
export const formControl =
  "block w-full px-3 py-1.5 text-[16px] leading-normal text-body bg-white border border-[#dee2e6] rounded-[0.375rem] appearance-none transition-[border-color,box-shadow] duration-150 ease-in-out focus:border-[#86b7fe] focus:outline-0 focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]";

/** săgeata din .form-select */
export const selectArrow =
  "bg-[url(data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2016%2016%27%3e%3cpath%20fill=%27none%27%20stroke=%27%23343a40%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%272%27%20d=%27m2%205%206%206%206-6%27/%3e%3c/svg%3e)] bg-no-repeat bg-position-[right_0.75rem_center] bg-size-[16px_12px]";

/** .appointment .php-email-form input/select/textarea */
export const appointmentField =
  "block w-full text-default bg-transparent border border-default/20 rounded-none shadow-none text-[14px] leading-normal p-2.5! appearance-none transition-[border-color] duration-150 placeholder:text-default/30 focus:border-accent focus:outline-0";

/** .contact .php-email-form input[type=text|email], textarea */
export const contactField =
  "block w-full text-[14px] leading-normal py-2.5 px-[15px] shadow-none rounded-none text-default bg-white/50 border border-default/20 appearance-none transition-[border-color] duration-150 placeholder:text-default/30 focus:border-accent focus:outline-0";

/** .was-validated: chenar roșu/verde după prima încercare de trimitere */
export const validated =
  "group-data-validated/form:invalid:border-[#dc3545] group-data-validated/form:valid:border-[#198754]";

/** .php-email-form .loading / .error-message / .sent-message */
export const formLoading =
  "bg-surface text-center p-[15px] mb-6 before:content-[''] before:inline-block before:rounded-full before:w-6 before:h-6 before:mr-2.5 before:-mb-1.5 before:border-[3px] before:border-accent before:border-t-surface before:animate-spin";
export const formError = "bg-[#df1529] text-white text-left p-[15px] mb-6 font-semibold";
export const formSent = "text-white bg-[#059652] text-center p-[15px] mb-6 font-semibold";
