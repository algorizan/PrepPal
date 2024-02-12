import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const logo = require('../assets/logo.png')

const Signup = () => {

    const navigate = useNavigate();

    //Logic to stop submission on incomplete form. 
    //React bootstrap offical validation code for forms
    const [validated, setValidated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: { currentTarget: any; preventDefault: () => void; stopPropagation: () => void; }) => {
        event.preventDefault();
        try {
            const req = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': username,
                    'password': password
                }),
            };
            const res = await fetch("http://localhost:9001/api/users/createUsers", req).then(res => res.json());
            localStorage.setItem("token", res.token);
        } catch (err) {
            alert("something went wrong");
        }
        const token = localStorage.getItem("token");
        if (token) {
            if (token === "undefined") {
                alert("username already exists");
            }
            else {
                navigate("/");
            }

        }
        setValidated(true);
    };//end of React bootstrap offical validation code for forms

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="w-100" style={{ maxWidth: '400px' }}>
                <Card className="p-4" style={{ backgroundColor: "#F2E8DC" }}>
                    <div className="text-center mb-4">
                        <Image src={logo} alt="Logo" rounded />

                    </div>
                    <h2 className="text-center mb-4">Create your account</h2>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group controlId="formUser" style={{ paddingBottom: '16px' }}>
                            <Form.Control required type="text" placeholder="Username" onChange={(event) => setUsername(event.target.value)} />
                            <Form.Control.Feedback type="invalid">Please enter a username.</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" style={{ paddingBottom: '16px' }}>
                            <Form.Control required type="password" placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
                            <Form.Control.Feedback type="invalid">Please enter a password.</Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button className="mx-auto" variant="primary" type="submit" title="SignUp" size="lg">
                                Sign up
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </Container>
    );
};

export default Signup;
