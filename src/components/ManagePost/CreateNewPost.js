import moment from "moment/moment";
import { useMemo, useState } from "react";
import {
    ArrowClockwise,
    ChevronRight,
    CloudArrowUp,
    Dash,
    Fonts,
    InfoCircle,
    List,
    Plus,
    QuestionCircleFill,
    X,
    Youtube
} from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Input, Label, Modal, ModalBody, ModalHeader, Progress, Row, Tooltip } from "reactstrap";
import Swal from "sweetalert2";
import { postTypePlan, sellTypes, sellUnits, utilityList as initUtilityList } from "../../constants/menu";
import { checkArrayHasItem, convertInputTextToObject, formatCurrency, msgPendingFeature } from "../../utils";
import { uploadImage } from "../core/firebase";
import Select from "../core/Select";
import SelectAddress from "../core/SelectAddress";

function CreateNewPost(props) {
    const location = useLocation();
    const navigate = useNavigate()
    const dataEditPost = location?.state?.dataEditPost || {};
    // thong tin co ban
    const [isSell, setIsSell] = useState(true);
    const handleClickSaleType = (status) => {
        setIsSell(status);
    };

    const [sellType, setSellType] = useState(sellTypes[0].value);
    const handleChangeSellType = (event) => {
        setSellType(event.target.value);
    };

    const [address, setAddress] = useState(
        dataEditPost.address || {
            city: "",
            district: "",
            ward: "",
            number: "",
        }
    );
    // thong tin bai dang

    const [title, setTitle] = useState(dataEditPost.title || "");
    const [description, setDescription] = useState(dataEditPost.description || "");

    // thong tin bat dong san

    const [areaSize, setAreaSize] = useState(dataEditPost.areaSize || "");
    const [price, setPrice] = useState(dataEditPost.price || { value: "", unit: sellUnits[0].value });
    const [quantityInfo, setQuantityInfo] = useState(dataEditPost.quantityInfo || { bedRoom: 0, bathRoom: 0, floor: 0 });
    const handleChangeQuantityInfo = (value, field) => {
        if (value >= 0) {
            setQuantityInfo({ ...quantityInfo, [field]: Number(value) });
        }
    };
    const handleClickQuantityButton = (type, field) => {
        if (type === "increase") {
            handleChangeQuantityInfo(quantityInfo[field] + 1, field);
        } else {
            handleChangeQuantityInfo(quantityInfo[field] - 1, field);
        }
    };

    // Tien ich

    const [utilityList, setUtilityList] = useState(initUtilityList);
    const [selectedUtilities, setSelectedUtilities] = useState([]);
    const [openModalAddUtility, setOpenModalAddUtility] = useState(false);
    const [utilityText, setUtilityText] = useState("");

    const handleAddUtilityList = (item) => {
        const newValue = [...utilityList, convertInputTextToObject(item)];
        setUtilityList(newValue);
        setSelectedUtilities([...selectedUtilities, convertInputTextToObject(item)]);
        setOpenModalAddUtility(false);
        setUtilityText("");
    };

    const handleClickUtility = (item) => {
        let newValue = [];
        const existed = checkArrayHasItem(item.value, selectedUtilities, "value");
        if (existed) {
            newValue = selectedUtilities.filter((util) => util.value !== item.value);
        } else {
            newValue = [...selectedUtilities, item];
        }
        setSelectedUtilities(newValue);
    };

    // Thong tin bo sung
    const [entranceSize, setEntranceSize] = useState(dataEditPost.entranceSize || "");
    const [frontSize, setFrontSize] = useState(dataEditPost.frontSize || "");
    const [youtubeLink, setYoutubeLink] = useState("");

    // Thong tin lien he
    const [contactInfo, setContactInfo] = useState(
        dataEditPost.contactInfo || {
            name: "",
            phoneNumber: "",
            address: "",
            email: "",
        }
    );

    const handleChangeContactInfo = (value, field) => {
        const newValue = { ...contactInfo, [field]: value };
        setContactInfo(newValue);
    };

    // file upload
    const [fileUpload, setFileUpload] = useState([]);
    const [imageUrls, setImageUrls] = useState(dataEditPost.imageUrls || []);
    const [loadingUploadImage, setLoadingUploadImage] = useState({
        status: false,
        value: 0,
    });

    const handleUploadFiles = async (files) => {
        setLoadingUploadImage({ status: true, value: 10 });
        const arrayImage = Object.values(files);
        const result = await Promise.all(arrayImage.map((item) => uploadImage(item)));
        setFileUpload(files);
        if(result.length > 16) {
            Swal.fire('', 'T???i ??a 16 ???nh!')
        } else {
            setImageUrls(result);
        }
        setLoadingUploadImage({ status: true, value: 100 });
        setTimeout(() => {
            setLoadingUploadImage({ status: false, value: 10 });
        }, 500);
    };

    const handleClickCancelFile = () => {
        setFileUpload({});
    };
    const FileLabel = () => {
        return (
            <div className="d-flex flex-wrap align-items-center">
                {imageUrls.map((item, index) => (
                    <div className="m-2" key={index}>
                        <img style={{ height: "100px", weight: "100%" }} alt="upload" src={item} />
                    </div>
                ))}
                <div className="cursor-pointer" onClick={handleClickCancelFile}>
                    Hu???
                    <X size="28" />
                </div>
            </div>
        );
    };
    const RequiredMark = () => <span style={{ color: "red" }}>*</span>;

    // Post config
    const [postPlan, setPostPlan] = useState(1);
    const [viewMorePostType, setViewMorePostType] = useState(true);
    const [highlightPost, setHighlightPost] = useState(false);
    const [postDays, setPostDays] = useState(10);
    const [postStartDate, setPostStartDate] = useState(dataEditPost.postStartDate || moment(new Date()).format("YYYY-MM-DD"));
    const [postStartTime, setPostStartTime] = useState(moment(new Date()).format("HH:mm"));
    const [autoRePost, setAutoRePost] = useState(false);

    const totalPrice = useMemo(() => {
        let total = 0;
        total = Number(postTypePlan[postPlan].price) * postDays;
        if (highlightPost) {
            total = Math.ceil(total * 1.2);
        }
        return total;
    }, [postPlan, postDays, highlightPost]);

    const [tooltipOpen, setTooltipOpen] = useState({
        highlightPost: false,
        rePost: false,
    });

    const handleClickPostPlan = (id) => {
        setPostPlan(id);
    };

    const handleClickSubmit = (e) => {
        e.preventDefault();
        if (imageUrls >= 4 && imageUrls <= 16) {
            Swal.fire('', '????ng tin th??nh c??ng!')
            setTimeout(() => {
                navigate('/post')
            }, 1000)
        } else {
            Swal.fire('', 'S??? l?????ng ???nh cho m???i tin ????ng t???i thi???u l?? 4 ???nh v?? t???i ??a l?? 16 ???nh!')
        }
    };

    const toggle = (type) => setTooltipOpen({ ...tooltipOpen, [type]: !tooltipOpen[type] });
    return (
        <div className="page-container-md">
            {dataEditPost.address && <h4 className="mt-2">Ch???nh s???a b??i ????ng</h4>}
            <Card className="mt-3 p-4">
                <h5>Th??ng tin c?? b???n</h5>
                {/* <ButtonGroup className="mt-3">
                    <Button size="sm" outline={!isSell} onClick={() => handleClickSaleType(true)}>
                        B??n
                    </Button>
                    <Button size="sm" outline={isSell} onClick={() => handleClickSaleType(false)}>
                        Cho thu??
                    </Button>
                </ButtonGroup> */}
                <div className="mt-2">
                    <div className="mt-2">
                        <h6>
                            Lo???i ph??ng <RequiredMark />
                        </h6>
                        <Select value={sellType} label="VD: Nh?? ri??ng" onChange={handleChangeSellType} options={sellTypes} />
                    </div>
                    <SelectAddress address={address} setAddress={setAddress} />
                </div>
            </Card>
            <Card className="mt-3 p-4">
                <h5>Th??ng tin b??i vi???t</h5>
                <div className="mt-2">
                    <h6>
                        Ti??u ?????
                        <RequiredMark />
                    </h6>
                    <Input
                        fullWidth
                        value={title}
                        placeholder="VD: Cho thu?? nh?? ri??ng 50m2 ch??nh ch??? t???i C???u Gi???y"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Label className="opacity-75 mt-1">T???i thi???u 30 k?? t???, t???i ??a 99 k?? t???</Label>
                </div>
                <div className="mt-2">
                    <h6>
                        M?? t???
                        <RequiredMark />
                    </h6>
                    <Input
                        type="textarea"
                        fullWidth
                        style={{ minHeight: "200px" }}
                        value={description}
                        placeholder="Nh???p m?? t??? chung v??? b???t ?????ng s???n c???a b???n. V?? d???: Khu nh?? c?? v??? tr?? thu???n l???i, g???n c??ng vi??n, g???n tr?????ng h???c ... "
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Label className="opacity-75 mt-1">T???i thi???u 30 k?? t???, t???i ??a 3.000 k?? t???</Label>
                </div>
            </Card>
            <Card className="mt-3 p-4">
                <h5>Th??ng tin ph??ng tr???</h5>
                <div className="mt-2">
                    <h6>
                        Di???n t??ch
                        <RequiredMark />
                    </h6>
                    <Input fullWidth value={areaSize} placeholder="Nh???p di???n t??ch, VD 80" onChange={(e) => setAreaSize(e.target.value)} />
                </div>
                <div className="mt-4">
                    <Row>
                        <Col md={9}>
                            <h6>
                                M???c gi??
                                <RequiredMark />
                            </h6>
                            <Input
                                fullWidth
                                value={price.value}
                                placeholder="Nh???p gi??, VD 12000000000"
                                onChange={(e) => setPrice({ ...price, value: e.target.value })}
                            />
                        </Col>
                        <Col md={3}>
                            <h6>
                                ????n v???
                                <RequiredMark />
                            </h6>
                            <Select
                                value={price.unit}
                                onChange={(e) => setPrice({ ...price, unit: e.target.value })}
                                placeholder="Nh???p gi??, VD 12000000000"
                                options={sellUnits}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="mt-4">
                    <h6>
                        Ti???n ??ch
                        <RequiredMark />
                    </h6>
                    <div className="d-flex flex-wrap">
                        {utilityList.map((item, index) => (
                            <Badge
                                className={`utility__item cursor-pointer mx-2 p-2 ${
                                    checkArrayHasItem(item.value, selectedUtilities, "value") ? "utility__item--selected" : ""
                                }`}
                                color={checkArrayHasItem(item.value, selectedUtilities, "value") ? "danger" : ""}
                                key={index}
                                onClick={() => handleClickUtility(item)}
                            >
                                {item.label}
                            </Badge>
                        ))}
                        {/* <Button size="sm" outline className="d-flex align-items-center" onClick={() => setOpenModalAddUtility(true)}>
                            <Plus />
                        </Button> */}
                        <Modal isOpen={openModalAddUtility} toggle={() => setOpenModalAddUtility(!openModalAddUtility)} centered>
                            <ModalHeader toggle={() => setOpenModalAddUtility(!openModalAddUtility)}>Th??m ti???n ??ch</ModalHeader>
                            <ModalBody>
                                <div>T??n ti???n ??ch</div>
                                <div className="d-flex pb-4">
                                    <Input value={utilityText} onChange={(e) => setUtilityText(e.target.value)} />
                                    <Button color="danger" onClick={() => handleAddUtilityList(utilityText)}>
                                        Th??m
                                    </Button>
                                </div>
                            </ModalBody>
                        </Modal>
                    </div>
                </div>
                <hr />
                <div className="mt-4">
                    <div className="d-flex justify-content-between">
                        <h6>S??? ph??ng ng???</h6>
                        <div className="d-flex align-items-center">
                            <Button outline onClick={() => handleClickQuantityButton("decrease", "bedRoom")}>
                                <Dash />
                            </Button>
                            <Input
                                className="text-center"
                                style={{ width: "50px" }}
                                type="number"
                                value={quantityInfo.bedRoom}
                                onChange={(e) => handleChangeQuantityInfo(Number(e.target.value), "bedRoom")}
                            />
                            <Button outline onClick={() => handleClickQuantityButton("increase", "bedRoom")}>
                                <Plus />
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                        <h6>S??? ph??ng t???m, v??? sinh</h6>
                        <div className="d-flex align-items-center">
                            <Button outline onClick={() => handleClickQuantityButton("decrease", "bathRoom")}>
                                <Dash />
                            </Button>
                            <Input
                                className="text-center"
                                style={{ width: "50px" }}
                                type="number"
                                value={quantityInfo.bathRoom}
                                onChange={(e) => handleChangeQuantityInfo(Number(e.target.value), "bathRoom")}
                            />
                            <Button outline onClick={() => handleClickQuantityButton("increase", "bathRoom")}>
                                <Plus />
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                        <h6>S??? t???ng</h6>
                        <div className="d-flex align-items-center">
                            <Button outline onClick={() => handleClickQuantityButton("decrease", "floor")}>
                                <Dash />
                            </Button>
                            <Input
                                className="text-center"
                                style={{ width: "50px" }}
                                type="number"
                                value={quantityInfo.floor}
                                onChange={(e) => handleChangeQuantityInfo(Number(e.target.value), "floor")}
                            />
                            <Button outline onClick={() => handleClickQuantityButton("increase", "floor")}>
                                <Plus />
                            </Button>
                        </div>
                    </div>
                </div>
                {/* <hr />
                <div className="mt-4">
                    <div className="">
                        <h6>????????ng va??o</h6>
                        <Input value={entranceSize} onChange={(e) => setEntranceSize(e.target.value)} placeholder="Nh???p s???" />
                    </div>
                    <div className="mt-4">
                        <h6>M????t ti????n</h6>
                        <Input value={frontSize} onChange={(e) => setFrontSize(e.target.value)} placeholder="Nh???p s???" />
                    </div>
                </div> */}
            </Card>
            <Card className="mt-3 p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h5>H??nh ???nh & Video</h5>
                    <div className="opacity-75 d-flex align-items-center">
                        <InfoCircle className="me-1" />
                        <a alt="policy" href="#" style={{ color: "#000", textDecoration: "none" }}>
                            Quy ?????nh ????ng h??nh & video
                        </a>
                    </div>
                </div>
                <ul className="mt-2">
                    <li> H??y d??ng ???nh th???t, kh??ng tr??ng, kh??ng ch??n s??? ??i???n tho???i</li>
                    <li>M???i ???nh k??ch th?????c t???i thi???u 100x100 px, t???i ??a 15 MB</li>
                    <li>S??? l?????ng ???nh cho m???i tin ????ng t???i thi???u l?? 4 ???nh v?? t???i ??a l?? 16 ???nh</li>
                </ul>
                <Label for="create-post-upload" className="create-post-upload__label d-flex flex-column align-items-center cursor-pointer p-4">
                    <CloudArrowUp size={50} />
                    <div>B???m ????? ch???n ???nh c???n t???i l??n</div>
                    <div className="opacity-75">ho???c k??o th??? ???nh v??o ????y</div>
                </Label>
                <Input
                    className="d-none"
                    id="create-post-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleUploadFiles(e.target.files)}
                />
                {!!imageUrls.length && !loadingUploadImage.status && <FileLabel />}
                {loadingUploadImage.status && <Progress value={loadingUploadImage.value} />}
                <div className="mt-4">
                    <div className="d-flex align-items-center">
                        <Youtube className="me-2" /> Th??m video t??? Youtube
                    </div>
                    <Input placeholder="Nh???p url" className="mt-2" value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} />
                </div>
            </Card>
            <Card className="mt-3 p-4">
                <h5>Th??ng tin li??n h???</h5>
                <div className="mt-2">
                    <h6>
                        T??n li??n h???
                        <RequiredMark />
                    </h6>
                    <Input
                        fullWidth
                        value={contactInfo.name}
                        placeholder="Nh???p t??n"
                        onChange={(e) => handleChangeContactInfo(e.target.value, "name")}
                    />
                </div>
                <div className="mt-4">
                    <h6>
                        S??? ??i???n tho???i
                        <RequiredMark />
                    </h6>
                    <Input
                        fullWidth
                        value={contactInfo.phoneNumber}
                        placeholder="Nh???p s??? ??i???n tho???i"
                        onChange={(e) => handleChangeContactInfo(e.target.value, "phoneNumber")}
                    />
                </div>
                <div className="mt-4">
                    <h6>
                        ?????a ch???
                        <RequiredMark />
                    </h6>
                    <Input
                        fullWidth
                        value={contactInfo.address}
                        placeholder="Nh???p ?????a ch???"
                        onChange={(e) => handleChangeContactInfo(e.target.value, "address")}
                    />
                </div>
                <div className="mt-4">
                    <h6>
                        Email
                        <RequiredMark />
                    </h6>
                    <Input
                        fullWidth
                        value={contactInfo.email}
                        placeholder="Nh???p email"
                        onChange={(e) => handleChangeContactInfo(e.target.value, "email")}
                    />
                </div>
            </Card>
            <Card className="mt-3 p-4">
                <h5>C???u h??nh tin ????ng</h5>
                <h6>Ch???n lo???i tin ????ng</h6>
                <div className="d-flex post-plan__container mt-2">
                    {postTypePlan.map((plan, index) => (
                        <div
                            style={{ flex: "1" }}
                            className={`post-plan__item text-center cursor-pointer p-2 ${postPlan === index ? "post-plan__item--selected" : ""}`}
                            key={index}
                            onClick={() => handleClickPostPlan(index)}
                        >
                            <div className={`mt-2 plan__tag plan__tag--${index}`}>X{plan.performance} hi???u qu???</div>
                            <h6 className="mb-4 mt-3">{plan.title}</h6>
                            <Button color="info" outline={postPlan !== plan.id}>
                                {postPlan !== plan.id ? "Ch???n" : "???? ch???n"}
                            </Button>
                            <hr />
                            <Fonts />
                            <div>
                                Ti??u ????? ch??? {plan.id > 1 ? "hoa" : "th?????ng"}{" "}
                                <span style={{ color: plan.titleColor.color }}>{plan.titleColor.label}</span>
                            </div>
                            <hr />
                            <List />
                            <div style={{ minHeight: "52px" }} className="mt-3">
                                {plan.position}
                            </div>
                            <hr />
                            <div className="mt-3">{plan.postDays}</div>
                            <hr />
                            <div className="mt-3 pb-3">
                                <b>
                                    {formatCurrency(plan.price)}?? <br />
                                </b>
                            </div>
                        </div>
                    ))}
                </div>

                {/* <div className="d-flex mt-3">
                    <Input
                        className="me-1"
                        id="highlight-post"
                        type="checkbox"
                        value={highlightPost}
                        onChange={(e) => setHighlightPost(e.target.checked)}
                    />
                    <Label for="highlight-post" id="highlight-post__label">
                        L??m n???i b???t tin ????ng
                        <QuestionCircleFill />
                    </Label>
                    <Tooltip target="highlight-post__label" isOpen={tooltipOpen.highlightPost} toggle={() => toggle("highlightPost")}>
                        ??? G???n nh??n N???I B???T c?? m??u theo lo???i tin
                        <br />
                        ??? Hi???n th??? 3 ???nh ?????i di???n ??? trang danh s??ch
                        <br />??? N??t b???m Hi???n s??? ??i???n tho???i
                    </Tooltip>
                </div>
                <hr /> */}
                {/* <Row>
                    <Col md={4}>
                        <div className="mt-2">
                            <h6>
                                S??? ng??y ????ng
                                <RequiredMark />
                            </h6>
                            <Input type="number" value={postDays} onChange={(e) => setPostDays(e.target.value)} placeholder="Nh???p s??? ng??y ????ng" />
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="mt-2">
                            <h6>
                                Ng??y b???t ?????u
                                <RequiredMark />
                            </h6>
                            <Input type="date" value={postStartDate} onChange={(e) => setPostStartDate(e.target.value)} />
                            <div>
                                K???t th??c ng??y{" "}
                                {moment(new Date(postStartDate).setDate(new Date(postStartDate).getDate() + postDays)).format("DD/MM/YYYY")}
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="mt-2">
                            <h6>
                                H???n gi??? ????ng tin
                                <RequiredMark />
                            </h6>
                            <Input disabled type="time" value={postStartTime} onChange={(e) => setPostStartTime(e.target.value)} />
                        </div>
                    </Col>
                </Row> */}
            </Card>
            <Card className="mt-3 p-4">
                <h5>Ti???n ??ch</h5>
                <div className="mt-3 d-flex justify-content-between">
                    <div className="d-flex align-items-start">
                        <Button disabled className="me-3" color="danger">
                            <ArrowClockwise />
                        </Button>
                        <div>
                            <h6>
                                <Input
                                    className="me-2"
                                    color="danger"
                                    type="switch"
                                    value={autoRePost}
                                    onChange={(e) => setAutoRePost(e.target.value)}
                                />
                                T??? ?????ng ????ng l???i{" "}
                            </h6>
                            <div id="auto_repost">
                                Tin s??? ???????c ????ng l???i ngay khi tin v???a h???t h???n. M???i l???n ????ng l???i, h??? th???ng ch??? tr??? ti???n c???a l???n ????ng l???i ????.
                                <QuestionCircleFill />
                            </div>
                            <Tooltip isOpen={tooltipOpen.rePost} target="auto_repost" toggle={() => toggle("rePost")}>
                                Tin s??? ???????c ????ng l???i ngay khi tin v???a h???t h???n. <br />??? ?????n th???i ??i???m ????ng l???i, h??? th???ng m???i th???c hi???n tr??? ti???n.
                                <br />
                                ??? M???i l???n tin ???????c ????ng l???i, h??? th???ng ch??? tr??? ti???n c???a l???n ????ng l???i ????.
                                <br />??? Tr?????c ????, qu?? kh??ch c?? th??? h???y ch??? ????? t??? ?????ng, v?? kh??ng ph??t sinh chi ph?? g?? th??m.
                            </Tooltip>
                        </div>
                    </div>
                    <div></div>
                </div>
            </Card>
            <Card className="mt-3 p-4">
                <h5>Thanh to??n</h5>
                <div className="mt-2">
                    <div className="d-flex justify-content-between mt-2">
                        <div>Lo???i tin</div>
                        <h6>{postTypePlan[postPlan].title}</h6>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                        <div>????n gi?? / ng??y</div>
                        <h6>{formatCurrency(postTypePlan[postPlan].price)}??</h6>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                        <div>Th???i gian ????ng tin</div>
                        <h6>{postDays} ng??y</h6>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mt-2">
                        <div>T???ng ti???n</div>
                        <h3>{formatCurrency(totalPrice)} ??</h3>
                    </div>
                </div>
            </Card>
            <Card className="mt-3 p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <Button outline onClick={msgPendingFeature}>Xem tr?????c giao di???n</Button>
                    <div className="d-flex align-items-center">
                        <div className="me-2">
                            <div>T???ng ti???n</div>
                            <div className="d-flex align-items-start">
                                <b>{formatCurrency(totalPrice)} ??</b>
                            </div>
                        </div>
                        <Button color="danger" type="submit" onClick={handleClickSubmit}>
                            Thanh to??n v?? ????ng tin <ChevronRight />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default CreateNewPost;
