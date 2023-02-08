(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 
                              'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|85354-9']
                      }
                    }
                  });

        var allergies = smart.patient.api.fetchAll({
            type: 'AllergyIntollerance',
            query: {"patient":smart.patient.id,
              "clinical-status": 'active'}
           });
        
        $.when(pt, obv, allergies).fail(onError);

        $.when(pt, obv,allergies).done(function(patient, obv, allergies) {
          console.log(patient);
          console.log(obv);
          console.log(allergies);
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;
          var dob = new DATE(patient.birthDATE);
          var day = dob.getDate();
          var monthIndex = dob.getMonth () + 1;
          var year = dob.getFullYear ();
          
          var dobStr = monthIndex + '/' + day + '/' + year;
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family;
          }

          for 
          
          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('85354-9'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('85354-9'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');
          var allergyTable = "<table>";
          var allergyLen = allergies.length;
          for (var 1=0; i<allergyLen; i++) {
            var reactionStr = [];
            if(allergies[i].reaction !== undefined) {
            for var j=0, jLen=allergies[i].reactionlength;j<jLen;j++)
            reactionStr.push(allergies[i].reaction[j].mainfestation[0].text);
            }
            
           allergyTable += "<tr><td>"+allergies[i].code.text+"</td><td>"+reactionStr.join(",")+"</td></tr>";
            ;
            if (allergyTable += "</table>";
                
          var p = defaultPatient();
          p.allergies = allergyTable;  
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.age = parseInt(calculateAge(dob));  
          p.height = getQuantityValueAndUnit(height[0]);

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
      allergies: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
    $('#allergies').html(p.allergies)
  };

})(window);
