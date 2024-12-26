import {
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "@services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const response = await api.post("login", data);
      const token = response?.data?.token;
      if (token) {
        localStorage.setItem("authToken", token);
        setSnackbar({
          open: true,
          message: "Login successful!",
          severity: "success",
        });
        navigate("/");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Login failed. Please check your email and password.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <form
        className="flex flex-col gap-8 bg-white shadow-shadow-1 px-12 py-16 w-[450px] rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Sign in
        </Typography>
        <FormControl>
          <FormLabel sx={{ paddingBottom: "8px" }} htmlFor="email">
            Email
          </FormLabel>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="email"
                type="email"
                placeholder="eve.holt@reqres.in"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel sx={{ paddingBottom: "8px" }} htmlFor="password">
            Password
          </FormLabel>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="password"
                type="password"
                placeholder="pistol"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
        </FormControl>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ marginTop: "15px", paddingY: "8px" }}
        >
          Sign in
        </Button>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
