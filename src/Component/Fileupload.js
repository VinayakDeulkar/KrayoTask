import React, { useEffect, useState } from 'react'
import { Form, Button, Row, Col, Table, Navbar, Nav } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import myBucket from '../AwsConfig'
export default function Fileupload() {
    const [selectedFile, setselectedFile] = useState(null)
    const [UploadedData, setUploadedData] = useState([])
    const [Token, setToken] = useState(null)
    const navigate = useNavigate()
    useEffect(() => {
        setToken(JSON.parse(localStorage.getItem('_token')))
        const params = {
            Bucket: process.env.REACT_APP_BUCKETNAME
        }
        //Get All files from Bucket
        myBucket.listObjects(params, (err, res) => {
            if (err) console.log(err)
            else {
                const data = []
                res.Contents.map((ele) => {
                    const l = ele.Key.includes(JSON.parse(localStorage.getItem('_token')).googleId)
                    if (l) {
                        data.push(ele.Key)
                    }
                })
                setUploadedData(data)
            }
        })
        console.log('inside useeffect');
    }, [])

    //Select File function
    const handleChange = (e) => {
        setselectedFile(e.target.files[0])
    }

    //Logout Function
    const Logout = () => {
        localStorage.removeItem('_token')
        navigate('/')
    }


    //Logic for Uploading File
    const fileupload = async (file) => {
        const fileName = Token.googleId + "_" + file.name.toLowerCase().split(" ").join("-");
        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: process.env.REACT_APP_BUCKETNAME,
            Key: fileName
        }
        myBucket.putObject(params, (err, res) => {
            if (err) {
                console.log(err)
            }
            else {
                alert('File Uploaded Successfully!!!!!')
            }
        })
    }
    return (
        <div>
            <Navbar bg='dark' expand='lg' className='text-light'>
                <Navbar.Brand className='text-light'> Krayo File Upload</Navbar.Brand>
                <Nav className='ms-auto me-3'>
                    <span className='p-2'>{Token?.email}</span>
                    <Button variant='dark' onClick={Logout}>LogOut</Button>
                </Nav>
            </Navbar>
            <Row className='m-1'>
                <Col lg={3} />
                <Col lg={6} className="mt-5 mb-5 text-center">
                    <Form onSubmit={() => fileupload(selectedFile)}>
                        <Form.Control
                            type='file'
                            className='mb-3'
                            placeholder='Upload Here'
                            onChange={handleChange}
                            name="file" />
                        <Button type='submit' variant='primary'>Upload File</Button>
                    </Form>
                </Col>
                <Col lg={3} />
            </Row>
            <Row className='ms-1 me-1 '>
                <h4 className='text-center'>Uploaded files By {Token?.email}</h4>
                <Col lg={12}>
                    <Table>
                        <thead>
                        </thead>
                        <tbody>
                            {UploadedData?.map((ele) =>
                                <tr key={ele}>
                                    <td><a href={`https://${process.env.REACT_APP_BUCKETNAME}.s3.${process.env.REACT_APP_REGION}.amazonaws.com/${ele}`} className='filename'>{ele}</a></td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </div>
    )
}
