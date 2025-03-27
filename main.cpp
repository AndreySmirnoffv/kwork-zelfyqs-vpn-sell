#include <map>
#include <iostream>
#include <type_traits>
#include <utility>

template<typename K, typename V>
class interval_map {
    friend void IntervalMapTest();
    V m_valBegin;
    std::map<K, V> m_map;

public:
    template<typename V_forward>
    interval_map(V_forward&& val)
        : m_valBegin(std::forward<V_forward>(val)) {}

    template<typename V_forward>
    void assign(K const& keyBegin, K const& keyEnd, V_forward&& val)
        requires (std::is_same<std::remove_cvref_t<V_forward>, V>::value)
    {
        if (!(keyBegin < keyEnd)) return;

        auto itLow = m_map.lower_bound(keyBegin);
        auto itHigh = m_map.lower_bound(keyEnd);

        V prevVal = (itLow == m_map.begin()) ? m_valBegin : std::prev(itLow)->second;
        V nextVal = (itHigh == m_map.end()) ? m_valBegin : itHigh->second;

        if (prevVal == val && nextVal == val) return;

        m_map.erase(itLow, itHigh);

        if (prevVal != val) {
            m_map[keyBegin] = val;
        }

        if (nextVal != val) {
            m_map[keyEnd] = nextVal;
        }

        auto it = m_map.begin();
        while (it != m_map.end()) {
            auto next = std::next(it);
            if (next != m_map.end() && it->second == next->second) {
                m_map.erase(next);
            } else {
                ++it;
            }
        }
    }

    V const& operator[](K const& key) const {
        auto it = m_map.upper_bound(key);
        if (it != m_map.begin()) {
            return (--it)->second;
        }

        return m_valBegin;
    }

    void print() const {
        std::cout << "m_valBegin = " << m_valBegin << std::endl;
        for (const auto& [key, value] : m_map) {
            std::cout << key << " -> " << value << std::endl;
        }
    }
};

int main() {
    interval_map<int, char> myMap('A');  
    myMap.assign(1, 5, 'B');  
    myMap.assign(3, 7, 'A');  
    myMap.assign(8, 10, 'C');  
    myMap.assign(5, 6, 'B');  

    std::cout << "Interval Map Initialized!" << std::endl;
    myMap.print();
    return 0;
}
