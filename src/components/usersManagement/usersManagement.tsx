import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TablePagination from "@mui/material/TablePagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@services/api";
import { Avatar, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const userSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
});

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
}

export default function UsersList() {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [paginationValues, setPaginationValues] = useState<{ total: number }>({
    total: 0,
  });
  const [header, setHeader] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "add" | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
    },
  });

  const getUsersList = async () => {
    const response = await api.get(`users/?${page}`);
    const userKeys = Object.keys(response.data.data[0]);
    setHeader(userKeys);
    setUsersList(response.data.data);
    setPaginationValues(response.data);
  };

  useEffect(() => {
    getUsersList();
  }, [page]);

  const openModal = (mode: "edit" | "add", user?: User) => {
    setModalMode(mode);
    if (mode === "edit" && user) {
      setSelectedUser(user);
      reset(user);
    } else {
      reset({ email: "", first_name: "", last_name: "" });
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleSaveUser = async (data: Omit<User, "id" | "avatar">) => {
    try {
      const userParams = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      };
      const cloneUsersList = [...usersList];
      if (modalMode === "edit" && selectedUser) {
        await api.put(`users/${selectedUser.id}`, userParams);
        const newUsersList = cloneUsersList.map((user) =>
          user.id === selectedUser.id ? { ...user, ...userParams } : user
        );
        console.log(selectedUser);
        setUsersList(newUsersList);
        setSnackbar({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
        //   getUsersList();   The API source does not update correctly after editing or deleting APIs
      } else if (modalMode === "add") {
        await api.post("users", userParams);
        const addUser = [
          ...cloneUsersList,
          { id: cloneUsersList.length + 1, ...userParams, avatar: "" },
        ];
        console.log(addUser);
        setPaginationValues((prevValue) => {return {total:prevValue.total + 1}})
        setUsersList(addUser);
        setSnackbar({
          open: true,
          message: "User added successfully",
          severity: "success",
        });
      }
      //   getUsersList();  The API source does not update correctly after editing or deleting APIs
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save user",
        severity: "error",
      });
    } finally {
      closeModal();
    }
  };

  const confirmDelete = (userId: number) => {
    setConfirmDeleteId(userId);
  };

  const handleDelete = async () => {
    try {
      if (confirmDeleteId !== null) {
        await api.delete(`delete/${confirmDeleteId}`);
        setUsersList(usersList.filter((user) => user.id !== confirmDeleteId));
        //   getUsersList();   The API source does not update correctly after editing or deleting APIs
        setSnackbar({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete user",
        severity: "error",
      });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const logoutHandler = async () => {
    try {
      const response = await api.post("logout");
      console.log("logout: ", response);
      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to logout ",
        severity: "error",
      });
    }
  };
  return (
    <>
      <TableContainer component={Paper} sx={{ paddingX: "8px" }}>
        <Stack direction="row" justifyContent="" gap={"20px"} p={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => openModal("add")}
          >
            Add User
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => logoutHandler()}
          >
            Logout
          </Button>
        </Stack>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              {header.map((title) => (
                <StyledTableCell key={title}>{title}</StyledTableCell>
              ))}
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersList.map((row: User) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell>{row.id}</StyledTableCell>
                <StyledTableCell>{row.email}</StyledTableCell>
                <StyledTableCell>{row.first_name}</StyledTableCell>
                <StyledTableCell>{row.last_name}</StyledTableCell>
                <StyledTableCell>
                  <Avatar
                    alt={`${row.first_name} ${row.last_name}`}
                    src={row.avatar}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => openModal("edit", row)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => confirmDelete(row.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[6]}
          component="div"
          count={paginationValues?.total}
          rowsPerPage={6}
          page={page - 1}
          onPageChange={(_, page: number) => setPage(page + 1)}
      
        />
      </TableContainer>

      {/* Add/Edit User Modal */}
      <Dialog open={!!modalMode} onClose={closeModal}>
        <DialogTitle>
          {modalMode === "edit" ? "Edit User" : "Add User"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(handleSaveUser)}>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="first_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="First Name"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="last_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  label="Last Name"
                  fullWidth
                  margin="normal"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <DialogActions>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {modalMode === "edit" ? "Save" : "Add"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Toast Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
