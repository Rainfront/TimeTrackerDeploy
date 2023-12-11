import React, { useEffect, useState } from 'react';
import {
	Container,
	Col,
	Row,
	Nav,
	Navbar,
	Button,
	Offcanvas,
	ListGroup,
} from "react-bootstrap";
import { useSelector, useDispatch } from 'react-redux';
import { Link, Outlet } from 'react-router-dom';
import { ajaxForLogout, setCookieParamas } from '../Login/Api/login-logout';
import TimeTracker from './Time/TimeTracker';

import { GetLocation } from '../Redux/Requests/CalendarRequest';
import CheckModalWindow from './Service/CheckModalWindow';
import { MessageType } from './Service/NotificationModalWindow';
import { deleteCookie, getCookie, setCookie } from '../Login/Api/login-logout';
import { getCurrentUser, getCurrentUserPermissions } from '../Redux/epics';
import { Dispatch, RootState } from '../Redux/store'
import { clearErrorMessage as setLogout } from '../Redux/Slices/UserSlice';
import { setLocation, changeLocation } from '../Redux/Slices/LocationSlice';
import { setLoginByToken } from '../Redux/Slices/TokenSlicer';

import '../Custom.css';
import { setErrorStatusAndError as setErroMassageLocation } from '../Redux/Slices/LocationSlice';
import { ErrorMassagePattern } from '../Redux/epics';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { lngs } from "../i18n";


function AppNavbar() {

	const { t, i18n } = useTranslation();
	const getLanguageFromCookie = () => {
		let lang = getCookie("lang");
		if (lang === null) {
			lang = "en";
		}
		i18n.changeLanguage(lang);
	}


	const listOfTimeZones = useSelector((state: RootState) => {
		return state.location.listOfTimeZones
	})
	const geoOffset = useSelector((state: RootState) => {
		return state.location.userOffset
	})

	const tokenStatus = useSelector((state: RootState) => state.token.loginByToken)

	const [canUserApi, setCanUserApi] = useState("")

	const navigate = useNavigate();

	const dispatch = useDispatch();
	useEffect(() => {


		if (tokenStatus) {
			const canUseUserIp = getCookie("canUseUserIp")
			if (canUseUserIp && canUseUserIp === "true") {
				GetLocation().subscribe({
					next: (value) => {

						dispatch(setLocation({
							oldOffset: geoOffset,
							userOffset: value.timezone.gmt_offset * 60,
							timeZone: {
								name: `${value.city} (${value.country_code})`,
								value: value.timezone.gmt_offset * 60
							},
							country: value.country
						}))
						setCookie({ name: "canUseUserIp", value: 'true' })
					},
					error: () => setErroMassageLocation(ErrorMassagePattern)
				})
			} else if (!canUseUserIp) {
				setCanUserApi(t("Navbar.questionIP"))
			}
		}
	}, [tokenStatus]);

	useEffect(() => {
		getLanguageFromCookie();
		dispatch(getCurrentUser());
		dispatch(getCurrentUserPermissions());
	}, []);

	let user = useSelector((state: RootState) => state.currentUser.User);

	return (
		<Container fluid className='p-0 m-0 h-100'>
			<Navbar expand={false} className="bg-black height-header">
				<Container fluid className='justify-content-start'>
					<Navbar.Toggle aria-controls={`offcanvasNavbar-expand-false`} />
					<Navbar.Brand as={Link} to={"/"} className='ms-1'>TimeTracker</Navbar.Brand>
					{/* <Button variant='dark' onClick={() => {
						const list = listOfTimeZones.filter(l => l.value === geoOffset)
						const name = list[1] ? list[1].name : list[0].name
						const obj = listOfTimeZones.filter(l => l.name !== name)[0]
						if (obj)
							dispatch(changeLocation({ oldOffSet: geoOffset, newOffSet: obj.value }))
					}}>
						{(function () {
							const list = listOfTimeZones.filter(l => l.value === geoOffset)
							return list[1] ? list[1].name : list[0].name
						})()}
					</Button> */}

					<TimeTracker />
					<Nav.Link as={Link} to={user ? "/User/" + user.login : "/Login"} className=''>{user.login}</Nav.Link>
					<Navbar.Offcanvas
						id={`offcanvasNavbar-expand-false`}
						aria-labelledby={`offcanvasNavbarLabel-expand-false`}
						placement="start"
						data-bs-theme="dark"
					>
						<Offcanvas.Header closeButton>
							<Offcanvas.Title id={`offcanvasNavbarLabel-expand-false`}>
								TimeTracker
							</Offcanvas.Title>
						</Offcanvas.Header>
						<Offcanvas.Body>
							<Nav className="justify-content-end flex-grow-1 pe-3">
								<ListGroup>
									<ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Time"}
										className='m-0'>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
											className="bi bi-alarm me-1 mb-1" viewBox="0 0 16 16">
											<path
												d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z" />
											<path
												d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 3.5c0 .753.333 1.429.86 1.887A8.035 8.035 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5zM13.5 1c-.753 0-1.429.333-1.887.86a8.035 8.035 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1z" />
										</svg>
										{t("Navbar.timeItem")}
									</Nav.Link></ListGroup.Item>
									<ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Users"}
										className='m-0'>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
											className="bi bi-people me-1 mb-1" viewBox="0 0 16 16">
											<path
												d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
										</svg>
										{t("Navbar.usersItem")}
									</Nav.Link></ListGroup.Item>
									<ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/CreateUser"}
										className='m-0'>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
											className="bi bi-person-plus me-1 mb-1" viewBox="0 0 16 16">
											<path
												d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
											<path fillRule="evenodd"
												d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
										</svg>
										{t("Navbar.createUserItem")}
									</Nav.Link></ListGroup.Item>
									<ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'>
										<Nav.Link as={Link} to={"/Calendar"} className='m-0'>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
												className="bi bi-calendar me-1 mb-1" viewBox="0 0 16 16">
												<path
													d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
											</svg>
											{t("Navbar.calendarItem")}
										</Nav.Link>
									</ListGroup.Item>
									<ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'>
										<Nav.Link as={Link} to={"/Settings"} className='m-0'>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
											 className="bi bi-gear  me-1 mb-1" viewBox="0 0 16 16">
												<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
												<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
											</svg>
											{t("Navbar.settings")}
										</Nav.Link>
									</ListGroup.Item>
								</ListGroup>
							</Nav>
						</Offcanvas.Body>
						<Nav className="justify-content-center ps-2 mb-3 flex flex-grow-1">
							<ListGroup className="justify-content-end flex flex-grow-1 pe-3 ">
								<ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Login"}
									className='m-0'
									onClick={() => {
										ajaxForLogout(getCookie("refresh_token")!).subscribe({
											next: () => {
												Logout(dispatch, navigate)
											},
											error: () => {
												Logout(dispatch, navigate)
											}
										});
									}}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
										className="bi bi-box-arrow-left me-1 mb-1" viewBox="0 0 16 16">
										<path fillRule="evenodd"
											d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z" />
										<path fillRule="evenodd"
											d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z" />
									</svg>
									{t("Navbar.logoutItem")}
								</Nav.Link></ListGroup.Item>
							</ListGroup>

						</Nav>
					</Navbar.Offcanvas>
				</Container>
			</Navbar>

			<Col className='justify-content-end d-flex align-items-center p-0 m-0'>
				<Col className={`p-0 m-0`}>
					<Outlet />
				</Col>
			</Col>
			<CheckModalWindow isShowed={canUserApi !== ""} dropMessage={setCanUserApi} messageType={MessageType.Warning}
				agree={() => {
					GetLocation().subscribe({
						next: (value) => {

							dispatch(setLocation({
								oldOffset: geoOffset,
								userOffset: value.timezone.gmt_offset * 60,
								timeZone: {
									name: `${value.city} (${value.country_code})`,
									value: value.timezone.gmt_offset * 60,
								},
								country: value.country

							}))
							setCookie({ name: "canUseUserIp", value: 'true' })
						},
						error: () => setErroMassageLocation(ErrorMassagePattern)
					})
				}} reject={() => {
					setCookie({ name: "canUseUserIp", value: 'false' })
				}} t={t}>{t("Navbar.questionIP")}</CheckModalWindow>
		</Container>
	);
}

export function Logout(dispatch: Dispatch, navigate: ReturnType<typeof useNavigate>) {
	dispatch(setLogout());
	LogoutDeleteCookie();
	dispatch(setLoginByToken(false));
	navigate("/Login")
}

export function LogoutDeleteCookie() {
	deleteCookie("refresh_token");
	deleteCookie("access_token");
	deleteCookie("user_id");
	deleteCookie("canUseUserIp");
	setCookie({ name: "refresh_sent", value: "false" })
}

export default AppNavbar;
