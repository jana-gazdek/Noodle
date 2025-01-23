from flask import Flask, render_template, send_from_directory, jsonify, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://noodle-frontend.onrender.com"}})
from collections import Counter
import copy
import psycopg2
import os
import traceback
import time
from dotenv import load_dotenv

load_dotenv()

DB_PARAMS = {
    'host': os.getenv("DB_HOST"),
    'port': int(os.getenv("DB_PORT")),
    'dbname': os.getenv("DB_NAME"),
    'user': os.getenv("DB_USER"),
    'password':os.getenv("DB_PASSWORD"),
    'sslmode': "require"
}

def run_query(query, params=None):
    """Function to execute a SQL query."""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()

        cursor.execute(query, params)
        
        if query.strip().lower().startswith("select"):
            results = cursor.fetchall()
            return(results)
        else:
            conn.commit()

        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"Error: {e}")
    return None

def enter_query(query, params=None):
    """Function to execute a SQL query."""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()

        cursor.execute(query, params)
        
        if query.strip().lower().startswith("select"):
            results = cursor.fetchall()
            return None
        else:
            conn.commit()

        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"Error: {e}")
    return None

def check_and_signal(data):
    if all(not value for value in data.values()):
        return False
    else:
        return True


def lista_predmeta(predmet_data, razred):
    subjects_list = []
    predmeti_s_lab = []
    for predmet in predmet_data:
        if razred[0] in predmet['godine'].split(', ') and (predmet['smjer'] == run_query("SELECT smjer FROM uČenik WHERE razred = %s", (razred,))[0][0] or predmet['smjer'] == 'uni'):
            total_hours = predmet['brojsatova'] + predmet['brojlab']
            subjects_list.extend([predmet['imepredmet']] * total_hours)
        if razred[0] in predmet['godine'].split(', ') and predmet['brojlab'] != 0 and (predmet['smjer'] == run_query("SELECT smjer FROM uČenik WHERE razred = %s", (razred,))[0][0] or predmet['smjer'] == 'uni'):
            predmeti_s_lab.append(predmet['imepredmet'])

    return subjects_list, predmeti_s_lab


def get_brojlab_by_imepredmet(imepredmet, predmet_data):
    for predmet in predmet_data:
        if predmet['imepredmet'] == imepredmet:
            return predmet['brojlab']
    return None

def ispravi_vjezbe(tjedan, predmeti_s_lab):
    for imepredmet in predmeti_s_lab:
        for dan in tjedan:
            if dan.count(imepredmet) == 1:
                index = dan.index(imepredmet)
                dan[index] = dan[index] + " - vježbe"
                break

def transform_tjedan(tjedan):
    new_tjedan = []
    new_dan = []
    print(tjedan)

    for dan in tjedan:
        n = len(dan)
        if dan[n-2] == dan[n-3]:
            shift = 3
        else:
            shift = 2
        new_dan = dan[-shift:] + dan[:-shift]
        new_tjedan.append(new_dan)

    print(new_tjedan)
    return new_tjedan


def main():
    run_query("DELETE FROM raspored")
    query = "SELECT predmetid FROM predmet"
    params = ('12345678901',)
    predmetID_list = run_query(query, params)
    predmetID_list = [str(row[0]) for row in predmetID_list]
    predmet_data = []
    for ID in predmetID_list:
        temp_dict = {}
        temp_dict['imepredmet'] = run_query("SELECT imepredmet FROM predmet WHERE predmetID = %s", (ID,))[0][0]
        temp_dict['brojsatova'] = int(run_query("SELECT brojsatova FROM predmet WHERE predmetID = %s", (ID,))[0][0])
        temp_dict['brojlab'] = int(run_query("SELECT brojlab FROM predmet WHERE predmetID = %s", (ID,))[0][0])
        temp_dict['godine'] = run_query("SELECT godine FROM predmet WHERE predmetID = %s", (ID,))[0][0]
        temp_dict['smjer'] = run_query("SELECT smjer FROM predmet WHERE predmetID = %s", (ID,))[0][0]

        predmet_data.append(temp_dict)

    razredi = run_query("SELECT DISTINCT razred FROM uČenik")
    #print(razredi)
    oznake = run_query("SELECT DISTINCT oznaka FROM prostorija")
    #print(oznake)
    dostupne_prostorije = []
    profesori = run_query("SELECT djelatnikID FROM djelatnik")
    dostupni_profesori = []

    for o in oznake:
        dostupne_prostorije.append(o[0])
    #print(dostupne_prostorije)

    for ID in profesori:
        if run_query("SELECT status FROM djelatnik WHERE djelatnikID = %s", (ID[0],))[0][0] != "admin":
            temp_dict = {}
            predaje = run_query("SELECT razred FROM djelatnik WHERE djelatnikID = %s", (ID[0],))[0][0].split(",")
            temp_list = run_query("SELECT imepredmet FROM djelatnik NATURAL JOIN predaje NATURAL JOIN predmet WHERE djelatnikID = %s", (ID[0],))
            for l in list(set(temp_list)):
                if(l[0] == "Sat razrednika"):
                    temp_dict[l[0]] = [run_query("SELECT razrednik FROM djelatnik WHERE djelatnikID = %s", (ID[0],))[0][0]]
                else:
                    temp_dict[l[0]] = predaje
            dostupni_profesori.append(temp_dict)

    #print(dostupni_profesori)

    razredi_PREDMETI = {}
    razredi_PREDMETI_LAB = {}
    razredi_RASPORED_TJEDAN = []
    predviden_broj_predmeta_po_razredu = []
    least_frequently_used = {}
    razredi_prethodni_predmet = {}
    for razred in razredi:
        razredi_RASPORED_DAN = {}
        predmeti, labovi = lista_predmeta(predmet_data, razred[0])
        razredi_RASPORED_DAN[razred[0]] = []
        predviden_broj_predmeta_po_razredu.append({razred[0]:dict(sorted(Counter(predmeti).items(), key=lambda item: item[1]))})
        razredi_RASPORED_TJEDAN.append(razredi_RASPORED_DAN)
        razredi_PREDMETI[razred[0]] = predmeti
        razredi_PREDMETI_LAB[razred[0]] = labovi
        least_frequently_used[razred[0]] = {}
        razredi_prethodni_predmet[razred[0]] = 'NONE'
        for LFU_predmet in (list(set(predmeti))):
            least_frequently_used[razred[0]][LFU_predmet] = 1
    
    #print(least_frequently_used)
    #print(razredi_PREDMETI)

    temrin_ID = 0

    dostupni_profesori_BACKUP = copy.deepcopy(dostupni_profesori)
    dostupne_prostorije_BACKUP = dostupne_prostorije

    for i in range(1, 6):
        vrijeme_h = 8
        vrijeme_min = 0
        predmeti_u_danu = []
        for razred in razredi:
            temp_dict = {}
            temp_dict[razred[0]] = []
            predmeti_u_danu.append(temp_dict)
        while not(vrijeme_h == 13 and vrijeme_min == 50):
            dostupni_profesori = copy.deepcopy(dostupni_profesori_BACKUP)
            dostupne_prostorije = list(dostupne_prostorije_BACKUP)
            for razred in razredi:

                dijeli_profesora = {}                                   
                for predaje in dostupni_profesori_BACKUP:     
                    for key in predaje:                           
                        if razred[0] in predaje[key] and key in razredi_PREDMETI[razred[0]]:  
                            temp_n = 0
                            for zajednicki_razred in predaje[key]:
                                if key in razredi_PREDMETI[zajednicki_razred]:
                                    temp_n += 1
                            dijeli_profesora[key] = temp_n

                #print(dijeli_profesora)
                temrin_ID += 1
                PROVJERA_2_PREDMETA_U_DANU = []
                for predmeti_razred in predmeti_u_danu:
                    if razred[0] in predmeti_razred:
                        PROVJERA_2_PREDMETA_U_DANU = copy.deepcopy(predmeti_razred[razred[0]])
                flag = True
                counter = dict(Counter(razredi_PREDMETI[razred[0]]))
                for LFU_key in counter:
                    blok_sat_fix = 1
                    if dict(Counter(razredi_PREDMETI[razred[0]]))[LFU_key] > 5 - i and LFU_key in PROVJERA_2_PREDMETA_U_DANU:
                        blok_sat_fix = 1000
                    counter[LFU_key] = counter[LFU_key] * least_frequently_used[razred[0]][LFU_key] * blok_sat_fix
                counter = dict(sorted(counter.items(), key=lambda item: (item[1], dijeli_profesora[item[0]]), reverse = True))
                #print(counter)
                predmeti_REZERVA = []
                predaje_REZERVA = []
                for predmet in counter:
                    for predaje in dostupni_profesori:
                        for key in predaje:
                            if razred[0] in predaje.get(predmet, "Nema") and flag == True and key in razredi_PREDMETI[razred[0]] and PROVJERA_2_PREDMETA_U_DANU.count(key) < 2:
                                if key in PROVJERA_2_PREDMETA_U_DANU and counter[key] <= 5 - i and key != razredi_prethodni_predmet[razred[0]]:         #upitno je li counter[key] <= 5 uopće potrebno
                                    predmeti_REZERVA.append(key)
                                    predaje_REZERVA.append(copy.deepcopy(predaje))
                                    #print("REZERVA NA ČEKANJU: " + razred[0] + ", predmet: " + key)
                                    #print(predmeti_REZERVA)
                                else:
                                    dostupni_profesori.remove(predaje)
                                    razredi_PREDMETI[razred[0]].remove(key)
                                    flag = False
                                    time_str = f"{vrijeme_h:02}:{vrijeme_min:02}"
                                    for predmeti_razred in predmeti_u_danu:
                                        if razred[0] in predmeti_razred:
                                            predmeti_razred[razred[0]].append(key)
                                    least_frequently_used[razred[0]][key] = 1
                                    razredi_prethodni_predmet[razred[0]] = key
                                    PROVJERA_2_PREDMETA_U_DANU.append(key)      
                                    enter_query(                     
                                        "INSERT INTO raspored (terminid, razred, oznaka, imepredmet, labos, školaid, dan, vrijeme) VALUES(%s, %s, %s, %s, %s, %s, %s, %s)",
                                        (temrin_ID,
                                        razred,
                                        "DVORANA" if key == "TZK" else dostupne_prostorije.pop(),
                                        key,
                                        "ne",
                                        '1',
                                        i,
                                        time_str)
                                    )
                if flag == True and len(predmeti_REZERVA) != 0:
                    #print("REZERVA UMETNUTA")
                    dostupni_profesori.remove(predaje_REZERVA[0]) 
                    razredi_PREDMETI[razred[0]].remove(predmeti_REZERVA[0])             
                    time_str = f"{vrijeme_h:02}:{vrijeme_min:02}"
                    for predmeti_razred in predmeti_u_danu:
                        if razred[0] in predmeti_razred:
                            predmeti_razred[razred[0]].append(predmeti_REZERVA[0])
                    least_frequently_used[razred[0]][key] = 1
                    PROVJERA_2_PREDMETA_U_DANU.append(key)
                    razredi_prethodni_predmet[razred[0]] = key
                    enter_query(
                        "INSERT INTO raspored (terminid, razred, oznaka, imepredmet, labos, školaid, dan, vrijeme) VALUES(%s, %s, %s, %s, %s, %s, %s, %s)",
                        (temrin_ID,
                        razred,
                        "DVORANA" if key == "TZK" else dostupne_prostorije.pop(),
                        predmeti_REZERVA[0],
                        "ne",
                        '1',
                        i,
                        time_str)
                    )
                elif flag == True:
                    time_str = f"{vrijeme_h:02}:{vrijeme_min:02}"
                    enter_query(
                        "INSERT INTO raspored (terminid, razred, oznaka, imepredmet, labos, školaid, dan, vrijeme) VALUES(%s, %s, %s, %s, %s, %s, %s, %s)",
                        (temrin_ID,
                        razred,
                        "/",
                        "PRAZAN_SAT",
                        "ne",
                        '1',
                        i,
                        time_str)
                    )  
                #print(str(temrin_ID) + " " + razred[0])
                if vrijeme_h == 13:
                    for LFU_predmet in least_frequently_used[razred[0]]:
                        if LFU_predmet not in PROVJERA_2_PREDMETA_U_DANU:
                            least_frequently_used[razred[0]][LFU_predmet] += 1
                    #print(PROVJERA_2_PREDMETA_U_DANU)
            x = vrijeme_min + 50
            vrijeme_h = vrijeme_h + x//60
            vrijeme_min = x % 60
    
    #print(razredi_PREDMETI)

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/run-script', methods=['POST'])
def run_script():
    start_time = time.time()
    try:
        print("Starting script execution...")
        main()
        response = {'status': 'success', 'message': 'Script executed successfully'}
    except Exception as e:
        response = {'status': 'error', 'message': str(e)}
        print("ERROR:", str(e))
    finally:
        execution_time = time.time() - start_time
        print(f"Script execution time: {execution_time:.2f} seconds")
    return jsonify(response)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=True)

