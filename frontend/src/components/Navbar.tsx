import { Navbar, Container } from "react-bootstrap";

export default function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">LecturerMind</Navbar.Brand>
      </Container>
    </Navbar>
  );
}
