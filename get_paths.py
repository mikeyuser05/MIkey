import os

def save_all_paths():
    output_file = "all_file_paths.txt"
    
    with open(output_file, "w", encoding="utf-8") as f:
        # पूरे प्रोजेक्ट की डायरेक्टरी को स्कैन करने के लिए
        for root, dirs, files in os.walk("."):
            # .git या node_modules जैसी बिना काम की फ़ोल्डर्स को छोड़ने के लिए
            if any(ignored in root for ignored in [".git", "node_modules", "__pycache__"]):
                continue
                
            for file in files:
                # relative path निकालने के लिए
                relative_path = os.path.join(root, file)
                # पाथ को साफ सुथरा (./ हटाकर) लिखने के लिए
                clean_path = os.path.normpath(relative_path)
                f.write(clean_path + "\n")
                
    print(f"✅ सभी फ़ाइलों के पाथ '{output_file}' में सेव हो गए हैं!")

if __name__ == "__main__":
    save_all_paths()
