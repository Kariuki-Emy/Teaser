Vue.use(VueLoading);
Vue.component('loading', VueLoading)

Vue.use(VeeValidate);

Vue.component('property-details', {
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        return {
            contact_agent:"Contact agent",
            full_names:"",
            phone_number:"",
            email_address:"",
            error_message:"",
            pref:"254",
            mpesa_phone_number:"",
            property_details:"Prop Details",
            mortgage_details:{
                rate: 11.5,
                deposit:0,
                duration:1
            },
            scheduled_date: new Date(),
            pid: "",
            cid : "",
            contact_details:{
                first_name:"",
                last_name:"",
                phone_number:"",
                email:"",
                message:""
            },
            submit_button_property_details: false,
            entities:[
                {
                    id: 2,
                    name: "Riverbank apartments",
                    database_name : "riverbank_apartments_crm",
                    domain : "riverbankapartments.co.ke"
                }
            ],
            monthly_payment:0,
            total_loan:0
        }
    },
    computed:{

    },
    mounted(){

        const urlParams = new URLSearchParams(window.location.search);
        this.pid = urlParams.get('pid');
        this.cid = urlParams.get('development');


        this.getPropertyTypeDetails();

    },
    methods: {

        calculateMortgage(){

            if (this.mortgage_details.deposit > 0 && this.mortgage_details.duration > 0 ){
                this.monthly_payment = Math.round( (this.mortgage_details.deposit * ((this.mortgage_details.rate / 100 ) / 12) * Math.pow((1 + ((this.mortgage_details.rate / 100) / 12)),this.mortgage_details.duration / 12)) / (Math.pow((1 + (this.mortgage_details.rate / 100 ) / 12), ( this.mortgage_details.duration / 12 ) )));

            }

        },

        scheduleVisit(){

            let self = this;


            $('#bookSiteVisitModal').modal('toggle');

            const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'numeric', day: '2-digit' })
            const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(this.scheduled_date )

            let modified_month = month < 10 ? 0+""+month:month;

            let post_data = {
                company_id:this.cid,
                property_id:this.pid,
                phone_number:this.phone_number,
                email:this.email_address,
                full_names:this.full_names,
                date_of_visit: year+"-"+modified_month+"-"+day,
                channel:"Centum Re Website"
            };

            let loader = this.$loading.show({
                // Optional parameters
                container: null,
                canCancel: true,
                onCancel: this.onCancel,
            });


            axios.post('https://cascadiaapartments.co.ke/api/scheduleVisit', post_data, {
                headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            })
                .then(response => {
                    loader.hide();

                    if(response.data.status_code == 200){


                        swal("Success", "Our agent will contact shortly with details.", "success");

                        //location.replace("/property?pid="+self.pid+"&development="+this.cid)
                    }
                    else{


                        swal("Oooooops", "An error occurred. Please try again later.", "error");
                    }

                    //self.property_details = response.data;


                })
                .catch(function (error) {

                    loader.hide();

                    swal("Oooooops", "An error occurred. Please try again later.", "error");



                });
        },

        getPropertyTypeDetails(){

            let self = this;


            axios.get('https://cascadiaapartments.co.ke/api/getPropertyTypeDetails/'+this.pid+"/"+this.cid)
                .then(response => {


                    self.property_details = response.data;


                })
                .catch(function (error) {
                    console.log(error)
                });
        },
        validateBeforeSubmit(){
            let self = this;




            this.$validator.validateAll().then((result) => {
                if (result){

                    self.saveContacts();
                }
                else{
                    console.log("Not validating");
                }

                //alert('Correct them errors!');
            });
        },

        saveContacts(){
            var self = this;

            self.submit_button_property_details = true;
            this.contact_agent = "Please wait ...";

            axios.post("https://cascadiaapartments.co.ke/api/newOpportunity",{
                lead:{
                    "entity": "riverbank_apartments_crm",
                    "property_type": this.property_details.property_type_name,
                    "first_name": this.contact_details.first_name,
                    "last_name": this.contact_details.last_name,
                    "company_name": "",
                    "source_id": 1,
                    "phone_number": this.contact_details.phone_number,
                    "email_address": this.contact_details.email,
                    "address": "",
                    "country": "",
                    "city": "",
                    "assigned_to": 5,
                    "lead_stage": "New Lead",
                    "position": "",
                    "website_url": "",
                    "salutation": "",
                    "national_id":"",
                    "source_information":this.contact_details.message +" - "+this.property_details.property_type_name,
                    "entities" : this.entities
                },
                units:[]

            }).then(function (response) {

                self.contact_agent = "Contact agent";

                self.submit_button_property_details = false;


                if(response.data.status_code == 200){

                    //location.replace("/opportunity/"+self.opportunity_type+"/"+self.opportunity_id+"?message=success");

                    self.contact_details.first_name = "";
                    self.contact_details.last_name = "";
                    self.contact_details.email = "";
                    self.contact_details.phone_number = "";
                    self.contact_details.message = "";

                    swal("Success", "You'll be contacted shortly.", "success");



                }
                else{
                    swal("Oooooops", "An error occurred. Please try again later.", "error");

                }

            }).catch(function (error) {

                self.contact_agent = "Contact agent";

                self.submit_button_property_details = false;

                swal("Oooooops", "An error occurred. Please try again later.", "error");
            });
        }
    },

});


Vue.component('development', {
    data () {
        return {
            development_name:"Riverbank Apartments",
            development_details:{}
        }
    },
    computed:{

    },
    mounted(){
        this.getDevelopmentDetails();
    },
    methods: {


        getDevelopmentDetails(){
            let self = this;



            axios.get('https://cascadiaapartments.co.ke/api/getDevelopmentByName?name='+this.development_name)
                .then(response => {
                    self.development_details = response.data;

                    console.log(response.data)

                })
                .catch(function (error) {

                    console.log(error)
                });
        },
    },
    watch: {

    }
});

new Vue({
    el: document.getElementById('site-wrapper')
})