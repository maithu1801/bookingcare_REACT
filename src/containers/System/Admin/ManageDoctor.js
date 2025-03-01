import React, { Component } from 'react';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from "../../../store/actions";
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import './ManageDoctor.scss';
import Select from 'react-select';
import { LANGUAGES, CRUD_ACTIONS } from "../../../utils";
import { getDetailInforDoctor, saveDetailDoctorService } from "../../../services/userService";
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';
import ReactHTMLTableToExcel from "react-html-table-to-excel";



const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //save to Mardown table
            contentMarkdown: '',
            contentHTML: '',
            selectedOption: '', // id bac si
            description: '',
            listDoctors: '',
            hasOldData: false,
            //save to doctor-infor table
            listPrice: [],
            listPayment: [],
            listProvince: [],
            listClinic: [],
            listSpecialty: [],

            selectedPrice: [],
            selectedPayment: '',
            selectedProvince: '',
            selectedClinic: '',
            selectedSpecialty: '',


            nameClinic: '',
            addressClinic: '',
            note: '',
            clinicId: '',
            specialtyId: '',

            edit: false,
            allDoctors: [],
            keyWord: '',
        }
    }

    async componentDidMount() {
        await this.props.fetchAllDoctors();
        await this.props.getAllRequiredDoctorInfor();
        this.setState({
            allDoctors: this.props.allDoctors
        })
    }

    buildDataInputSelect = (inputData, type) => {
        let result = [];
        let { language } = this.props;
        if (inputData && inputData.length > 0) {
            if (type === 'USERS') {
                inputData.map((item, index) => {
                    let object = {};
                    let labelVi = `${item.lastName} ${item.firstName}`;
                    let labelEn = `${item.firstName} ${item.lastName}`;
                    object.label = language === LANGUAGES.VI ? labelVi : labelEn;
                    object.value = item.id;
                    result.push(object)
                })
            }
            if (type === 'PRICE') {
                inputData.map((item, index) => {
                    let object = {};
                    let labelVi = `${item.valueVi} `;
                    let labelEn = `${item.valueEn} USD`;
                    object.label = language === LANGUAGES.VI ? labelVi : labelEn;
                    object.value = item.keyMap;
                    result.push(object)
                })
            }
            if (type === 'PAYMENT' || type === 'PROVINCE') {
                inputData.map((item, index) => {
                    let object = {};
                    let labelVi = `${item.valueVi}`;
                    let labelEn = `${item.valueEn}`;
                    object.label = language === LANGUAGES.VI ? labelVi : labelEn;
                    object.value = item.keyMap;
                    result.push(object)
                })
            }
            if (type === 'SPECIALTY') {
                inputData.map((item, index) => {
                    let object = {};
                    object.label = item.name;
                    object.value = item.id;
                    result.push(object)
                })
            }
            if (type === 'CLINIC') {
                inputData.map((item, index) => {
                    let object = {};
                    object.label = item.name;
                    object.value = item.id;
                    result.push(object)
                })
            }

        }
        return result;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.allDoctors !== this.props.allDoctors) {
            let dataSelect = this.buildDataInputSelect(this.props.allDoctors, 'USERS');
            this.setState({
                listDoctors: dataSelect
            })
        }

        if (prevProps.allRequiredDoctorInfor !== this.props.allRequiredDoctorInfor) {
            let { resPayment, resPrice, resProvince, resSpecialty, resClinic } = this.props.allRequiredDoctorInfor;
            let dataSelectPrice = this.buildDataInputSelect(resPrice, 'PRICE');
            let dataSelectPayment = this.buildDataInputSelect(resPayment, 'PAYMENT');
            let dataSelectProvince = this.buildDataInputSelect(resProvince, 'PROVINCE');
            let dataSelectSpecialty = this.buildDataInputSelect(resSpecialty, 'SPECIALTY');
            let dataselectedClinic = this.buildDataInputSelect(resClinic, 'CLINIC');

            this.setState({
                listPrice: dataSelectPrice,
                listPayment: dataSelectPayment,
                listProvince: dataSelectProvince,
                listSpecialty: dataSelectSpecialty,
                listClinic: dataselectedClinic
            })
        }
        if (this.props.language !== prevProps.language) {
            let dataSelect = this.buildDataInputSelect(this.props.allDoctors, 'USERS')
            let { resPayment, resPrice, resProvince } = this.props.allRequiredDoctorInfor;
            let dataSelectPrice = this.buildDataInputSelect(resPrice, 'PRICE');
            let dataSelectPayment = this.buildDataInputSelect(resPayment, 'PAYMENT');
            let dataSelectProvince = this.buildDataInputSelect(resProvince, 'PROVINCE');
            this.setState({
                listDoctors: dataSelect,
                listPrice: dataSelectPrice,
                listPayment: dataSelectPayment,
                listProvince: dataSelectProvince

            })
        }



    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentMarkdown: text,
            contentHTML: html,
        })
    }

    handleSaveContentMarkdown = () => {
        let { hasOldData } = this.state;
        this.props.saveDetailDoctor({
            contentHTML: this.state.contentHTML,
            contentMarkdown: this.state.contentMarkdown,
            description: this.state.description,
            doctorId: this.state.selectedOption.value,
            selectedProvince: this.state.selectedProvince.value,
            action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,

            selectedPrice: this.state.selectedPrice.value,
            selectedPayment: this.state.selectedPayment.value,
            selectedProvince: this.state.selectedProvince.value,
            nameClinic: this.state.nameClinic,
            addressClinic: this.state.addressClinic,
            note: this.state.note,
            clinicId: this.state.selectedClinic && this.state.selectedClinic.value ? this.state.selectedClinic.value : '',
            specialtyId: this.state.selectedSpecialty.value,
        })
    }

    handleChangeSelect = async (selectedOption) => {
        console.log("selectedOption", selectedOption);
        this.setState({ selectedOption });
        let { listPayment, listPrice, listProvince, listSpecialty, listClinic } = this.state;

        let res = await getDetailInforDoctor(selectedOption.value);
        if (res && res.errCode === 0 && res.data && res.data.Markdown) {
            let markdown = res.data.Markdown;

            let addressClinic = '', nameClinic = '', note = '',
                paymentId = '', priceId = '', provinceId = '',
                selectedPayment = '', selectedPrice = '', selectedProvince = '',
                selectedSpecialty = '', specialtyId = '', clinicId = '', selectedClinic = '';
            if (res.data.Doctor_Infor) {
                addressClinic = res.data.Doctor_Infor.addressClinic;
                nameClinic = res.data.Doctor_Infor.nameClinic;
                note = res.data.Doctor_Infor.note;
                paymentId = res.data.Doctor_Infor.paymentId;
                priceId = res.data.Doctor_Infor.priceId;
                provinceId = res.data.Doctor_Infor.provinceId;
                specialtyId = res.data.Doctor_Infor.specialtyId;
                clinicId = res.data.Doctor_Infor.clinicId;

                selectedPayment = listPayment.find(item => {
                    return item && item.value === paymentId
                })
                selectedPrice = listPrice.find(item => {
                    return item && item.value === priceId
                })
                selectedProvince = listProvince.find(item => {
                    return item && item.value === provinceId
                })
                selectedSpecialty = listSpecialty.find(item => {
                    return item && item.value === specialtyId
                })
                selectedClinic = listClinic.find(item => {
                    return item && item.value === clinicId
                })

            }

            this.setState({
                contentHTML: markdown.contentHTML,
                contentMarkdown: markdown.contentMarkdown,
                description: markdown.description,
                hasOldData: true,
                addressClinic: addressClinic,
                nameClinic: nameClinic,
                note: note,
                selectedPayment: selectedPayment,
                selectedPrice: selectedPrice,
                selectedProvince: selectedProvince,
                selectedSpecialty: selectedSpecialty,
                selectedClinic: selectedClinic
            })
        } else {
            this.setState({
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                hasOldData: false,
                addressClinic: '',
                nameClinic: '',
                note: '',
                selectedPayment: '',
                selectedPrice: '',
                selectedProvince: '',
                selectedSpecialty: '',
                selectedClinic: ''
            })
        }
    };

    handleOnChangeDesc = (event) => {
        this.setState({
            description: event.target.value
        })
    }
    handleChangeSelectDoctorInfor = async (selectedOption, name) => {
        let stateName = name.name;
        let stateCopy = { ...this.state };
        stateCopy[stateName] = selectedOption;
        this.setState({
            ...stateCopy
        })
    }
    handleOnChangeText = (event, id) => {
        let stateCopy = { ...this.state };
        stateCopy[id] = event.target.value;
        this.setState({
            ...stateCopy
        })
    }
    editDoctor = async (item) => {
        this.setState({
            edit: true
        })
        let data = {
            label: `${item.lastName} ${item.firstName}`,
            value: item.id
        }
        this.handleChangeSelect(data);
    }
    deleteDoctor = async (item) => {
        let data = {
            type: 'delete',
            id: item.id
        }
        let res = await saveDetailDoctorService(data);
        if (res.ok === 'OK') {
            toast.success("Xóa bác sĩ thành công !")
        } else {
            toast.error("Đã xảy ra lỗi !")
        }
        await this.props.fetchAllDoctors();
        this.setState({
            allDoctors: this.props.allDoctors
        })
    }
    handleOnChangeInput = (event, id) => {
        let copyState = { ...this.state };
        copyState[id] = event.target.value;
        this.setState({
            ...copyState
        })
    }
    searchDoctor = async () => {
        let data = {
            type: 'search',
            keyWord: this.state.keyWord
        }
        let res = await saveDetailDoctorService(data);
        if (res.err) {
            toast.error("Đã xảy ra lỗi !");
        } else if (res.doctor) {
            this.setState({
                allDoctors: res.doctor
            })
        }
    }
    selectAllDoctor = async () => {
        await this.props.fetchAllDoctors();
        this.setState({
            allDoctors: this.props.allDoctors
        })
    }
    render() {
        let { hasOldData } = this.state;

        return (
            <div className='manage-doctor-container'>
                <div className='manage-doctor-title'>
                    <FormattedMessage id="admin.manage-doctor.title" />
                    {this.state.edit === true &&
                        <div className='close-btn'>
                            <i class="fas fa-times"
                                onClick={() => {
                                    this.setState({
                                        edit: false
                                    })
                                }}></i>
                        </div>
                    }
                </div>
                {this.state.edit === false ?
                    <React.Fragment>
                        <div className='search-doctor'>
                            <input
                                placeholder="Tìm kiếm bác sĩ"
                                value={this.state.keyWord}
                                onChange={(event) => this.handleOnChangeInput(event, 'keyWord')}
                            >
                            </input>

                            <div className='search-doctor-btn'
                                onClick={() => this.searchDoctor()}
                            ><i class="fas fa-search"></i>
                            </div>

                            <div className='search-doctor-btn'
                                onClick={() => this.selectAllDoctor()}
                            ><i class="fas fa-undo"></i>
                            </div>
                            <div className="btn-excel">
                                <ReactHTMLTableToExcel
                                    id="test-table-xls-button"
                                    className="download-table-xls-button"
                                    table="table-excel"
                                    filename="Bacsi"
                                    sheet="Tatcabacsi"
                                    buttonText=""
                                >
                                </ReactHTMLTableToExcel>
                                <div className="excel-icon">
                                    <i class="fas fa-file-excel"></i>
                                </div>
                            </div>
                        </div>
                        <div className='table-doctor'>
                            <table id="TableManageUser">
                                <tbody>
                                    <tr>
                                        <th className='title center'>STT</th>
                                        <th className='title'>Ảnh đại diện</th>
                                        <th className='title'>Last Name</th>
                                        <th className='title'>First Name</th>
                                        <th className='title'>Email</th>
                                        <th className='title'>Address</th>
                                        <th className='title center'>Tool</th>
                                    </tr>
                                    {this.state.allDoctors.length > 0 ?
                                        <React.Fragment>
                                            {this.state.allDoctors.map((item, index) => {
                                                let imageBase64 = '';
                                                if (item.image) {
                                                    imageBase64 = new Buffer(item.image, 'base64').toString('binary');
                                                }
                                                return (
                                                    <tr key={index}>
                                                        <td className='center'>{index}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <img className='img-doctor' src={imageBase64} /></td>
                                                        <td>{item.lastName}</td>
                                                        <td>{item.firstName}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.address}</td>
                                                        <td >
                                                            <button className='btn-edit'>
                                                                <i className="fas fa-pencil-alt"
                                                                    onClick={() => this.editDoctor(item)}
                                                                ></i>
                                                            </button>
                                                            <button className="btn-delete">
                                                                <i className="fas fa-trash-alt"
                                                                    onClick={() => this.deleteDoctor(item)}
                                                                ></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })

                                            }
                                        </React.Fragment> :
                                        <React.Fragment>
                                            <tr>
                                                <td colSpan={5} className='center'>Không tìm thấy dữ liệu trùng khớp</td>
                                            </tr>
                                        </React.Fragment>
                                    }
                                </tbody>
                            </table>

                            {/* bang này xuất file excel */}
                            <table id="table-excel">
                                <tbody>
                                    <tr>
                                        <th className='title center'>STT</th>
                                        <th className='title'>Last Name</th>
                                        <th className='title'>First Name</th>
                                        <th className='title'>Email</th>
                                        <th className='title'>Address</th>
                                    </tr>
                                    {this.state.allDoctors.length > 0 ?
                                        <React.Fragment>
                                            {this.state.allDoctors.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className='center'>{index}</td>
                                                        <td>{item.lastName}</td>
                                                        <td>{item.firstName}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.address}</td>
                                                    </tr>
                                                )
                                            })

                                            }
                                        </React.Fragment> :
                                        <React.Fragment>
                                            <tr>
                                                <td colSpan={5} className='center'>Không tìm thấy dữ liệu trùng khớp</td>
                                            </tr>
                                        </React.Fragment>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </React.Fragment> :
                    <React.Fragment>
                        <div className='more-infor'>
                            <div className='content-left form-group'>
                                <label><FormattedMessage id="admin.manage-doctor.select-doctor" /></label>
                                <Select
                                    value={this.state.selectedOption}
                                    onChange={this.handleChangeSelect}
                                    options={this.state.listDoctors}
                                    placeholder={<FormattedMessage id="admin.manage-doctor.select-doctor" />}
                                />
                            </div>
                            <div className='content-right'>
                                <label><FormattedMessage id="admin.manage-doctor.intro" /></label>
                                <textarea className='form-control' rows='4'
                                    onChange={(event) => this.handleOnChangeText(event, 'description')}
                                    value={this.state.description}
                                >

                                </textarea>
                            </div>
                        </div>
                        <div className='more-infor-extra row'>
                            <div className='col-4 form-group'>
                                <label><FormattedMessage id="admin.manage-doctor.price" /></label>
                                <Select
                                    options={this.state.listPrice}
                                    onChange={this.handleChangeSelectDoctorInfor}
                                    value={this.state.selectedPrice}
                                    placeholder={<FormattedMessage id="admin.manage-doctor.price" />}
                                    name="selectedPrice"
                                />
                            </div>
                            <div className='col-4 from-group'>
                                <label><FormattedMessage id="admin.manage-doctor.payment" /></label>
                                <Select
                                    options={this.state.listPayment}
                                    onChange={this.handleChangeSelectDoctorInfor}
                                    value={this.state.selectedPayment}
                                    placeholder={<FormattedMessage id="admin.manage-doctor.payment" />}
                                    name="selectedPayment"
                                />
                            </div>
                            <div className='col-4 from-group'>
                                <label><FormattedMessage id="admin.manage-doctor.province" /></label>
                                <Select
                                    options={this.state.listProvince}
                                    onChange={this.handleChangeSelectDoctorInfor}
                                    value={this.state.selectedProvince}
                                    placeholder={<FormattedMessage id="admin.manage-doctor.province" />}
                                    name="selectedProvince"
                                />
                            </div>
                            <div className='col-4 form-group'>
                                <label><FormattedMessage id="admin.manage-doctor.nameClinic" /></label>
                                <input className='form-control'
                                    onChange={(event) => this.handleOnChangeText(event, 'nameClinic')}
                                    value={this.state.nameClinic}
                                />
                            </div>
                            <div className='col-4 form-group'>
                                <label><FormattedMessage id="admin.manage-doctor.addressClinic" /></label>
                                <input className='form-control'
                                    onChange={(event) => this.handleOnChangeText(event, 'addressClinic')}
                                    value={this.state.addressClinic}

                                />
                            </div>
                            <div className='col-4 form-group'>
                                <label><FormattedMessage id="admin.manage-doctor.note" /></label>
                                <input className='form-control'
                                    onChange={(event) => this.handleOnChangeText(event, 'note')}
                                    value={this.state.note}
                                />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-4 form-group'>
                                <label><FormattedMessage id="admin.manage-doctor.specialty" /></label>
                                <Select
                                    value={this.state.selectedSpecialty}
                                    options={this.state.listSpecialty}
                                    placeholder={<FormattedMessage id="admin.manage-doctor.specialty" />}
                                    onChange={this.handleChangeSelectDoctorInfor}
                                    name="selectedSpecialty"
                                />
                            </div>
                            <div className='col-4 form-group'>
                                <label><FormattedMessage id="admin.manage-doctor.select-clinic" /></label>
                                <Select
                                    value={this.state.selectedClinic}
                                    options={this.state.listClinic}
                                    placeholder={<FormattedMessage id="admin.manage-doctor.select-clinic" />}
                                    onChange={this.handleChangeSelectDoctorInfor}
                                    name="selectedClinic"

                                />
                            </div>

                        </div>
                        <div className='manage-doctor-editor'>
                            <MdEditor
                                style={{ height: '300px' }}
                                renderHTML={text => mdParser.render(text)}
                                onChange={this.handleEditorChange}
                                value={this.state.contentMarkdown}
                            />
                        </div>
                        <button
                            onClick={() => this.handleSaveContentMarkdown()}
                            className={hasOldData === true ? 'save-content-doctor' : 'create-content-doctor'}>
                            {hasOldData === true ?
                                <span><FormattedMessage id="admin.manage-doctor.save" /></span>
                                :
                                <span><FormattedMessage id="admin.manage-doctor.add" /></span>
                            }
                        </button>
                    </React.Fragment>
                }

            </div>
        );


    }

}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        allDoctors: state.admin.allDoctors,
        allRequiredDoctorInfor: state.admin.allRequiredDoctorInfor,
    };
};

const mapDispatchToProps = dispatch => {
    return {

        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
        saveDetailDoctor: (data) => dispatch(actions.saveDetailDoctor(data)),
        getAllRequiredDoctorInfor: () => dispatch(actions.getAllRequiredDoctorInfor())

    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
