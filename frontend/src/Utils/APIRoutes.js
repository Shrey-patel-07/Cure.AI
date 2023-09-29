export const host = "http://localhost:3001";
// export const host = "https://doctorai-392406.uw.r.appspot.com/";

export const userLoginRoute = `${host}/login`;
export const userSignupRoute = `${host}/signup`;
export const chatAiRoute = `${host}/general/chat`;

export const getUserDataRoute = (id) => `${host}/user/${id}`;
export const putUserDataRoute = (id) => `${host}/user/${id}`;

export const doctorSignupRoute = `${host}/doctor/signup`;
export const doctorLoginRoute = `${host}/doctor/login`;