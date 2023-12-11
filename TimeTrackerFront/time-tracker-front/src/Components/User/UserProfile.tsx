import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Modal, Row, Col, ProgressBar, InputGroup, ListGroup, Image } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User } from '../../Redux/Types/User';
import {
	RequestUpdateUser,
	RequestUpdatePassword,
	RequestUser,
	RequestCurrentUser
} from '../../Redux/Requests/UserRequests';
import { RootState } from '../../Redux/store';
import { ErrorMassagePattern, getCurrentUser, getUsers } from '../../Redux/epics';
import { Error } from '../Service/Error';
import '../../Custom.css';
import { RequestGetTimeInSeconds, RequestGetTotalWorkTime, RequestUserTime } from '../../Redux/Requests/TimeRequests';
import { getCookie } from '../../Login/Api/login-logout';
import { TimeForStatisticFromSeconds } from '../Time/TimeStatistic';
import VacationRequests from "./VacationRequests";
import { Time, TimeRequest } from '../../Redux/Types/Time';
import { Absence } from '../../Redux/Types/Absence';
import {
	RequestAddCurrentUserAbsence,
	RequestCurrentUserAbsences,
	RequestRemoveCurrentUserAbsence
} from '../../Redux/Requests/AbsenceRequests';
import NotificationModalWindow, { MessageType } from '../Service/NotificationModalWindow';
import { useTranslation } from "react-i18next";
import { startOfWeek } from '../../Redux/Slices/LocationSlice';
import { ajaxFor2fAuth, ajaxFor2fDrop, WayToDrop2f, axajSetUser2fAuth, _2fAuthResult } from '../../Login/Api/login-logout';
import Drop2factorAuht from './Drop2f';
import Set2factorAuth from './Set2f';

function UserProfile() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showEdit, setShowEdit] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showAbsence, setShowAbsence] = useState(false);

	const [showVacationRequests, setShowVacationRequests] = useState(false);

	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const [_2fAuthData, set2fAuthData] = useState<_2fAuthResult | null>(null);

	const handleCloseAbcense = () => {
		setShowAbsence(false);
		setShowError(false);
	};
	const handleShowAbcense = () => {
		RequestCurrentUserAbsences().subscribe(x => setAbsences(x));
		setShowAbsence(true);
	};

	const handleClosePassword = () => {
		setShowPassword(false);
		setShowError(false);
	};
	const handleShowPassword = () => setShowPassword(true);

	const handleCloseEdit = () => {
		setShowEdit(false);
		setShowError(false);
	};
	const handleShowEdit = () => setShowEdit(true);

	const handleShowVacationRequests = () => setShowVacationRequests(true);
	const handleCloseVacationRequests = () => setShowVacationRequests(false);

	const [user, setUser] = useState({} as User);
	const [time, setTime] = useState<TimeRequest>({
		time: {
			daySeconds: 0,
			weekSeconds: 0,
			monthSeconds: 0,
			sessions: []
		}
	});
	const [absences, setAbsences] = useState([] as Absence[]);
	const [totalWorkTime, setTotalWorkTime] = useState(0);

	const [id, setId] = useState(0);
	const [login, setLogin] = useState('');
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const [newPassword, setNewPassword] = useState('');
	const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

	const [enteredCode, setEnteredCode] = useState('')

	const [date, setDate] = useState<Date>();
	const [type, setType] = useState('Absence');
	const [isVisibleSet2fa, setVisibleSet2fa] = useState(false);

	const [isVisibleDrop2fa, setVisibleDrop2fa] = useState(false);
	const [code, setCode] = useState("")

	useEffect(() => {
		RequestCurrentUser().subscribe((x) => {
			setUser(x);
		})
		RequestGetTotalWorkTime(parseInt(getCookie("user_id")!)).subscribe((x) => {
			setTotalWorkTime(x);
		})
		RequestGetTimeInSeconds([], 1, 1, 0, startOfWeek.Monday).subscribe((x) => {
			setTime(x);
		})
	}, []);

	useEffect(() => {
		if (user) {
			setId(user.id!)
			setFullName(user.fullName!)
			setLogin(user.login!)
			setEmail(user.email!)
		}
	}, [user])


	const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!password || !login || !fullName) {
			setShowError(true);
			setErrorMessage(t("UserProfile.EditModal.fillFieldsError"));
			return;
		}
		const User: User = {
			id: id,
			login: login,
			fullName: fullName,
			email: email,
			password: password
		}
		RequestUpdateUser(User).subscribe({
			next(x) {
				if (x === "User updated successfully") {
					setShowEdit(false);
					RequestUser(parseInt(getCookie("user_id")!)).subscribe((x) => {
						setUser(x);
					})
					setShowError(false);
					setSuccess(t("UserProfile.EditModal.Responses.success"));
				} else {
					let response: string = x;
					switch (x) {
						case "Password is incorrect":
							response = t("UserProfile.EditModal.Responses.incorrectPassword");
							break;
						case "Login is already used":
							response = t("UserProfile.EditModal.Responses.takenLogin");
							break;
					}
					setError(response);
				}
			},
			error(error) {
				setError(ErrorMassagePattern)
			}
		});
	}

	const handlePasswordUpdate = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (newPassword != newPasswordRepeat) {
			setShowError(true);
			setErrorMessage(t("UserProfile.ChangePasswordModal.passMatchError"));
			return;
		}
		if (newPassword.length < 8 || newPassword.length > 50) {
			setShowError(true);
			setErrorMessage(t("UserProfile.ChangePasswordModal.passValidationError"));
			return;
		}
		RequestUpdatePassword(id, newPassword, password).subscribe({
			next(x) {
				if (x === "Password updated successfully") {
					setShowPassword(false);
					setShowError(false);
					setSuccess(t("UserProfile.ChangePasswordModal.Responses.successful"))
				} else {
					setError(t("UserProfile.ChangePasswordModal.Responses.incorrectPassError"));
				}
			},
			error(error) {
				setError(ErrorMassagePattern)
			}
		});
	}

	const handleAddAbsence = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (date === undefined) {
			setShowError(true);
			setErrorMessage(t("UserProfile.AbsenceModal.fillFieldsError"));
			return;
		}
		if (absences.filter((a) => a.date!.toLocaleString() === date!.toISOString().slice(0, 10)).length !== 0) {
			setShowError(true);
			setErrorMessage(t("UserProfile.AbsenceModal.takenDayError"));
			return;
		}
		const Absence: Absence = {
			userId: id,
			type: type,
			date: date
		}
		RequestAddCurrentUserAbsence(Absence).subscribe((x) => {
			setShowError(false);
			RequestCurrentUserAbsences().subscribe(x => setAbsences(x));
		});
	}

	const handleRemoveAbsence = (Absence: Absence) => {
		RequestRemoveCurrentUserAbsence(Absence).subscribe((x) => {
			setShowError(false);
			RequestCurrentUserAbsences().subscribe(x => setAbsences(x));
		});
	}

	return (

		<div className='UserDetails d-flex align-items-center flex-column m-1'>
			<Button variant='dark' className='ms-2 me-auto' onClick={() => navigate(-1)}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					className="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
					<path fillRule="evenodd"
						d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z" />
				</svg>
			</Button>
			{user! ? (
				<>
					<Card style={{ width: '18rem' }} className='w-75'>
						<Card.Body className='d-flex flex-column'>
							<Row className='mb-3'>
								<Col>
									<span
										className='d-flex flex-column border border-secondary rounded-1 p-3 w-100 h-100 bg-darkgray'>
										<p className='m-0 fs-5 text-white'>{user.fullName}</p>
										<p className="m-0 fs-6 text-secondary">@{user.login}</p>
										<p className="m-0 fs-6 text-secondary">{user.email}</p>
										<InputGroup className='mt-auto'>
											<Button variant='outline-secondary'
												onClick={handleShowEdit}>{t("UserProfile.editButton")}</Button>
											<Button variant='outline-secondary'
												onClick={handleShowPassword}>{t("UserProfile.changePassButton")}</Button>
											<Button variant='outline-secondary'
												onClick={handleShowAbcense}>{t("UserProfile.presence")}</Button>
											{user.key2Auth ? <Button variant='outline-secondary'
												onClick={() => setVisibleDrop2fa(true)
												}>{t("UserProfile.drop2Auth")}</Button>
												:
												<Button variant='outline-secondary'
													onClick={() => {
														ajaxFor2fAuth().subscribe({
															next: (data) => {
																set2fAuthData(data.response)
																setVisibleSet2fa(true)
															},
															error: (error) => {
																console.log(error)
																setError(ErrorMassagePattern)
															}
														})
													}}>{t("UserProfile.set2Auth")}</Button>}
										</InputGroup>
									</span>
								</Col>
								<Col>
									<span
										className='d-flex flex-column border border-secondary rounded-1 p-3 w-100 bg-darkgray'>
										<div className='d-flex flex-row w-100 justify-content-between mb-2'>
											<p className='m-0'>{t("UserProfile.workedToday")}</p>
											{TimeForStatisticFromSeconds(time!.time.daySeconds)}
										</div>
										<div className='d-flex flex-row w-100 justify-content-between mb-2'>
											<p className='m-0'>{t("UserProfile.workedWeek")}</p>
											{TimeForStatisticFromSeconds(time!.time.weekSeconds)}
										</div>
										<div className='d-flex flex-row w-100 justify-content-between mb-2'>
											<p className='m-0'>{t("UserProfile.workedMonth")}</p>
											{TimeForStatisticFromSeconds(time!.time.monthSeconds)}
										</div>
										<div className='d-flex flex-row w-100 justify-content-between mb-2'>
											<ProgressBar now={(time!.time.monthSeconds / totalWorkTime) * 100} animated className='w-75 mt-1'
												variant='success' />
											{TimeForStatisticFromSeconds(totalWorkTime)}
										</div>
									</span>
								</Col>
							</Row>
							<VacationRequests user={user}></VacationRequests>
						</Card.Body>
					</Card>
					<Modal
						show={showEdit}
						backdrop="static"
						keyboard={false}
						centered
						data-bs-theme="dark"
						onHide={handleCloseEdit}
					>

						<Form onSubmit={e => handleUpdate(e)}>
							<Modal.Header closeButton>
								<Modal.Title>{t("UserProfile.EditModal.header")}</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<Form.Group className="mb-3">
									<Form.Label>{t("UserProfile.EditModal.fullName")}</Form.Label>
									<Form.Control type="text" defaultValue={user.fullName}
										onChange={e => setFullName(e.target.value)} />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>{t("UserProfile.EditModal.login")}</Form.Label>
									<Form.Control type="text" defaultValue={user.login}
										onChange={e => setLogin(e.target.value)} />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>{t("UserProfile.EditModal.email")}</Form.Label>
									<Form.Control type="email" defaultValue={user.email}
										onChange={e => setEmail(e.target.value)} />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>{t("UserProfile.EditModal.password")}</Form.Label>
									<Form.Control type="password" onChange={e => setPassword(e.target.value)} />
									<Form.Text muted>{t("UserProfile.EditModal.hintPassword")}</Form.Text>
									<Error ErrorText={errorMessage} Show={showError}
										SetShow={() => setShowError(false)}></Error>
								</Form.Group>
							</Modal.Body>
							<Modal.Footer>
								<Button variant="secondary" onClick={handleCloseEdit}>{t("cancel")}</Button>
								<Button variant="success" type="submit">{t("update")}</Button>
							</Modal.Footer>
						</Form>
					</Modal>
					<Modal
						show={showPassword}
						backdrop="static"
						keyboard={false}
						centered
						data-bs-theme="dark"
						onHide={handleClosePassword}
					>
						<Form onSubmit={e => handlePasswordUpdate(e)}>
							<Modal.Header closeButton>
								<Modal.Title>{t("UserProfile.ChangePasswordModal.header")}</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<Form.Group className="mb-3">
									<Form.Label>{t("UserProfile.ChangePasswordModal.newPass")}</Form.Label>
									<Form.Control type="password" onChange={e => setNewPassword(e.target.value)} />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>{t("UserProfile.ChangePasswordModal.repeatNewPass")}</Form.Label>
									<Form.Control type="password" onChange={e => setNewPasswordRepeat(e.target.value)} />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>{t("UserProfile.ChangePasswordModal.oldPass")}</Form.Label>
									<Form.Control type="password" onChange={e => setPassword(e.target.value)} />
									<Form.Text muted>{t("UserProfile.ChangePasswordModal.hintPassword")}</Form.Text>
									<Error ErrorText={errorMessage} Show={showError}
										SetShow={() => setShowError(false)}></Error>
								</Form.Group>
							</Modal.Body>
							<Modal.Footer>
								<Button variant="secondary" onClick={handleClosePassword}>{t("cancel")}</Button>
								<Button variant="success" type="submit">{t("update")}</Button>
							</Modal.Footer>
						</Form>
					</Modal>
					<Modal
						show={showAbsence}
						backdrop="static"
						keyboard={false}
						centered
						data-bs-theme="dark"
						onHide={handleCloseAbcense}
					>
						<Modal.Header closeButton>
							<Modal.Title>{t("UserProfile.AbsenceModal.header")}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form className='mb-2' onSubmit={e => handleAddAbsence(e)}>
								<InputGroup>
									<Form.Control type="date" onChange={e => setDate(new Date(e.target.value))} />
									<Form.Select onChange={e => setType(e.target.value)}>
										<option value="Absence">{t("UserProfile.AbsenceModal.absenceItem")}</option>
										<option value="Illness">{t("UserProfile.AbsenceModal.illnessItem")}</option>
									</Form.Select>
									<Button variant='success' type='submit'>{t("add")}</Button>
								</InputGroup>
								<Error ErrorText={errorMessage} Show={showError}
									SetShow={() => setShowError(false)}></Error>
							</Form>
							<ListGroup className='w-100 d-flex scroll pe-2'>
								{
									absences?.map((absence, index) =>
										<ListGroup.Item key={index}
											className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
											<Row className='w-100'>
												<Col sm={4} className='d-flex align-items-center'>
													<p className='m-0 fs-5'>{absence.date!.toLocaleString()}</p>
												</Col>
												<Col sm={4} className='d-flex align-items-center'>
													<p className='m-0 fs-5'>{absence.type}</p>
												</Col>
												<Col className='d-flex align-items-center pe-0'>
													<Button variant="outline-danger"
														onClick={() => handleRemoveAbsence(absence)}
														className='ms-auto'>
														<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
															fill="currentColor"
															className="bi bi-trash mb-1" viewBox="0 0 16 16">
															<path
																d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
															<path
																d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
														</svg>
													</Button>
												</Col>
											</Row>
										</ListGroup.Item>
									)
								}
							</ListGroup>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleCloseAbcense}>{t("close")}</Button>
						</Modal.Footer>
					</Modal>
					<Drop2factorAuht isVisibleDrop2fa={isVisibleDrop2fa} setVisibleDrop2fa={setVisibleDrop2fa} setUser={setUser} />
					<Set2factorAuth isVisibleSet2fa={isVisibleSet2fa} setVisibleSet2fa={setVisibleSet2fa} setUser={setUser} _2fAuthData={_2fAuthData} />
					<NotificationModalWindow isShowed={error !== ""} dropMessage={setError}
						messageType={MessageType.Error}>{error}</NotificationModalWindow>
					<NotificationModalWindow isShowed={success !== ""} dropMessage={setSuccess}
						messageType={MessageType.Success}>{success}</NotificationModalWindow>
				</>
			)
				: (
					<p>User not found</p>
				)
			}
		</div>
	);
}

export default UserProfile;
